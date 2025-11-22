"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/rate', async (_req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
});
router.get('/:wallet', async (_req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
});
router.post('/initiate', async (_req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
});
router.post('/claim', async (_req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
});
router.post('/withdraw', async (_req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
});
exports.default = router;
