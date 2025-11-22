import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore, initializeFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

let app = getApps()[0];

if (!app) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKeyRaw) {
    const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    });

    // Prefer REST transport for Firestore to avoid gRPC/OpenSSL issues
    initializeFirestore(app, { preferRest: true });
  } else if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('Firebase service account env vars not set; Firestore features are disabled.');
  }
}

export const firestore = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
