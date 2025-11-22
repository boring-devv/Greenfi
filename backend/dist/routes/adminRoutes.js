"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebase_1 = require("../config/firebase");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
function ensureFirestore(res) {
    if (!firebase_1.firestore) {
        res.status(500).json({ message: 'Firestore not initialized' });
        return false;
    }
    return true;
}
// GET /admin/overview
router.get('/overview', authMiddleware_1.requireAdmin, async (_req, res) => {
    try {
        if (!ensureFirestore(res))
            return;
        const db = firebase_1.firestore;
        const [usersSnap, stakingSnap, nftsSnap, projectsSnap] = await Promise.all([
            db.collection('users').get(),
            db.collection('staking').get(),
            db.collection('impact_nfts').get(),
            db.collection('projects').get(),
        ]);
        let totalStaked = 0;
        let totalRewardsPaid = 0;
        stakingSnap.forEach((doc) => {
            const data = doc.data();
            totalStaked += Number(data.amount || 0);
            totalRewardsPaid += Number(data.rewards || 0);
        });
        let totalCarbonOffset = 0;
        nftsSnap.forEach((doc) => {
            const data = doc.data();
            totalCarbonOffset += Number(data.carbonOffset || 0);
        });
        res.json({
            totalUsers: usersSnap.size,
            totalStaked,
            rewardsPaidOut: totalRewardsPaid,
            nftsMinted: nftsSnap.size,
            totalCarbonOffset,
            projectsCount: projectsSnap.size,
        });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('Admin overview error', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// GET /admin/users
router.get('/users', authMiddleware_1.requireAdmin, async (_req, res) => {
    try {
        if (!ensureFirestore(res))
            return;
        const db = firebase_1.firestore;
        const snap = await db.collection('users').orderBy('createdAt', 'desc').limit(200).get();
        const users = snap.docs.map((doc) => doc.data());
        res.json({ users });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('Admin users error', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// GET /admin/projects
router.get('/projects', authMiddleware_1.requireAdmin, async (_req, res) => {
    try {
        if (!ensureFirestore(res))
            return;
        const db = firebase_1.firestore;
        const snap = await db.collection('projects').orderBy('projectName').get();
        const projects = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.json({ projects });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('Admin projects error', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
