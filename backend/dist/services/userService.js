"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.findUserByWallet = findUserByWallet;
exports.findUserById = findUserById;
exports.registerUser = registerUser;
exports.verifyUserPassword = verifyUserPassword;
const firebase_1 = require("../config/firebase");
const password_1 = require("../utils/password");
const uuid_1 = require("uuid");
if (!firebase_1.firestore) {
    throw new Error('Firestore not initialized');
}
const usersCollection = firebase_1.firestore.collection('users');
async function findUserByEmail(email) {
    const snap = await usersCollection.where('email', '==', email.toLowerCase()).limit(1).get();
    if (snap.empty)
        return null;
    return snap.docs[0].data();
}
async function findUserByWallet(walletAddress) {
    const snap = await usersCollection.where('walletAddress', '==', walletAddress.toLowerCase()).limit(1).get();
    if (snap.empty)
        return null;
    return snap.docs[0].data();
}
async function findUserById(id) {
    const doc = await usersCollection.doc(id).get();
    if (!doc.exists)
        return null;
    return doc.data();
}
async function registerUser(input) {
    const id = (0, uuid_1.v4)();
    const now = new Date().toISOString();
    const emailLower = input.email?.toLowerCase();
    const walletLower = input.walletAddress?.toLowerCase();
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const role = emailLower && adminEmail && emailLower === adminEmail ? 'ADMIN' : 'USER';
    const user = {
        id,
        email: emailLower,
        username: input.username,
        walletAddress: walletLower,
        passwordHash: input.password ? await (0, password_1.hashPassword)(input.password) : undefined,
        role,
        createdAt: now,
    };
    await usersCollection.doc(id).set(user);
    return user;
}
async function verifyUserPassword(email, password) {
    const user = await findUserByEmail(email);
    if (!user || !user.passwordHash)
        return null;
    const ok = await (0, password_1.comparePassword)(password, user.passwordHash);
    return ok ? user : null;
}
