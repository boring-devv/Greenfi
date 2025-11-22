import { firestore } from '../config/firebase';
import { hashPassword, comparePassword } from '../utils/password';
import { v4 as uuid } from 'uuid';

if (!firestore) {
  throw new Error('Firestore not initialized');
}

const usersCollection = firestore.collection('users');

export interface UserRecord {
  id: string;
  walletAddress?: string;
  email?: string;
  username?: string;
  passwordHash?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const snap = await usersCollection.where('email', '==', email.toLowerCase()).limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].data() as UserRecord;
}

export async function findUserByWallet(walletAddress: string): Promise<UserRecord | null> {
  const snap = await usersCollection.where('walletAddress', '==', walletAddress.toLowerCase()).limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].data() as UserRecord;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const doc = await usersCollection.doc(id).get();
  if (!doc.exists) return null;
  return doc.data() as UserRecord;
}

export interface RegisterInput {
  email?: string;
  username?: string;
  password?: string;
  walletAddress?: string;
}

export async function registerUser(input: RegisterInput): Promise<UserRecord> {
  const id = uuid();
  const now = new Date().toISOString();

  const emailLower = input.email?.toLowerCase();
  const walletLower = input.walletAddress?.toLowerCase();

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const role: UserRecord['role'] = emailLower && adminEmail && emailLower === adminEmail ? 'ADMIN' : 'USER';

  const user: UserRecord = {
    id,
    email: emailLower,
    username: input.username,
    walletAddress: walletLower,
    passwordHash: input.password ? await hashPassword(input.password) : undefined,
    role,
    createdAt: now,
  };
  const cleanUser = Object.fromEntries(
    Object.entries(user).filter(([, value]) => value !== undefined)
  ) as UserRecord;

  await usersCollection.doc(id).set(cleanUser);
  return cleanUser;
}

export async function verifyUserPassword(email: string, password: string): Promise<UserRecord | null> {
  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash) return null;
  const ok = await comparePassword(password, user.passwordHash);
  return ok ? user : null;
}
