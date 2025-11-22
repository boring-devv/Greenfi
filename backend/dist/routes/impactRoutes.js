"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/user/:wallet', async (_req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
});
router.get('/leaderboard', async (_req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
});
router.get('/project/:id', async (_req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
});
exports.default = router;
