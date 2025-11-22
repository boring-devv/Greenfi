"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
});
router.post('/add', async (_req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
});
router.post('/approve/:id', async (_req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
});
exports.default = router;
