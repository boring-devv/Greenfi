"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.firestore = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!firebase_admin_1.default.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
    if (projectId && clientEmail && privateKeyRaw) {
        const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
            projectId,
            // Prefer REST transport for Firestore to avoid gRPC/OpenSSL issues
            firestore: { preferRest: true },
        });
    }
    else if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('Firebase service account env vars not set; Firestore features are disabled.');
    }
}
exports.firestore = firebase_admin_1.default.apps.length ? (0, firestore_1.getFirestore)() : null;
exports.auth = firebase_admin_1.default.apps.length ? firebase_admin_1.default.auth() : null;
