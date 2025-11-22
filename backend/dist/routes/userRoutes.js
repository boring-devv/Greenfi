"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userService_1 = require("../services/userService");
const firebase_1 = require("../config/firebase");
const router = (0, express_1.Router)();
router.get('/:id', async (req, res) => {
    try {
        const user = await (0, userService_1.findUserById)(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({ user });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('Get user error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/:id/stats', async (req, res) => {
    try {
        if (!firebase_1.firestore) {
            return res.status(500).json({ message: 'Firestore not initialized' });
        }
        const user = await (0, userService_1.findUserById)(req.params.id);
        if (!user || !user.walletAddress) {
            return res.status(404).json({ message: 'User or wallet not found' });
        }
        const wallet = user.walletAddress;
        const stakingSnap = await firebase_1.firestore
            .collection('staking')
            .where('walletAddress', '==', wallet)
            .get();
        let totalStaked = 0;
        let totalRewards = 0;
        stakingSnap.forEach((doc) => {
            const data = doc.data();
            totalStaked += Number(data.amount || 0);
            totalRewards += Number(data.rewards || 0);
        });
        const nftSnap = await firebase_1.firestore
            .collection('impact_nfts')
            .where('walletAddress', '==', wallet)
            .get();
        const nftCount = nftSnap.size;
        return res.json({
            wallet,
            totalStaked,
            totalRewards,
            nftCount,
        });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('Get user stats error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/:id/nfts', async (req, res) => {
    try {
        if (!firebase_1.firestore) {
            return res.status(500).json({ message: 'Firestore not initialized' });
        }
        const user = await (0, userService_1.findUserById)(req.params.id);
        if (!user || !user.walletAddress) {
            return res.status(404).json({ message: 'User or wallet not found' });
        }
        const wallet = user.walletAddress;
        const nftSnap = await firebase_1.firestore
            .collection('impact_nfts')
            .where('walletAddress', '==', wallet)
            .get();
        const nfts = nftSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return res.json({ wallet, nfts });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('Get user nfts error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
