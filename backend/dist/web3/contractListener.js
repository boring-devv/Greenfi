"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startContractListener = startContractListener;
const firebase_1 = require("../config/firebase");
// Temporary stub: will later be expanded to listen to GreenFiCore contract events
async function startContractListener() {
    if (!firebase_1.firestore) {
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.warn('Skipping contract listener: Firestore not initialized');
        }
        return;
    }
    // For now, do nothing. We'll wire Firestore + contract events here later.
    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log('Contract listener stub initialized (no Firestore calls yet).');
    }
}
