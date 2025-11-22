"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const userService_1 = require("../services/userService");
const jwt_1 = require("../utils/jwt");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    username: zod_1.z.string().min(3).max(32).optional(),
    password: zod_1.z.string().min(6),
    walletAddress: zod_1.z.string().min(1).optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const walletConnectSchema = zod_1.z.object({
    walletAddress: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
});
router.post('/register', async (req, res) => {
    try {
        const body = registerSchema.parse(req.body);
        if (!body.email && !body.walletAddress) {
            return res.status(400).json({ message: 'email or walletAddress is required' });
        }
        if (body.email) {
            const existingByEmail = await (0, userService_1.findUserByEmail)(body.email);
            if (existingByEmail) {
                return res.status(409).json({ message: 'Email already in use' });
            }
        }
        if (body.walletAddress) {
            const existingByWallet = await (0, userService_1.findUserByWallet)(body.walletAddress);
            if (existingByWallet) {
                return res.status(409).json({ message: 'Wallet already connected' });
            }
        }
        const user = await (0, userService_1.registerUser)(body);
        const token = (0, jwt_1.signToken)({ userId: user.id, role: user.role });
        return res.status(201).json({ token, user });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Invalid payload', errors: err.errors });
        }
        // eslint-disable-next-line no-console
        console.error('Register error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const body = loginSchema.parse(req.body);
        const user = await (0, userService_1.verifyUserPassword)(body.email, body.password);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = (0, jwt_1.signToken)({ userId: user.id, role: user.role });
        return res.json({ token, user });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Invalid payload', errors: err.errors });
        }
        // eslint-disable-next-line no-console
        console.error('Login error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/wallet/connect', async (req, res) => {
    try {
        const body = walletConnectSchema.parse(req.body);
        const walletLower = body.walletAddress.toLowerCase();
        const existingByWallet = await (0, userService_1.findUserByWallet)(walletLower);
        if (existingByWallet) {
            const token = (0, jwt_1.signToken)({ userId: existingByWallet.id, role: existingByWallet.role });
            return res.json({ token, user: existingByWallet });
        }
        if (body.email) {
            const existingByEmail = await (0, userService_1.findUserByEmail)(body.email);
            if (existingByEmail) {
                return res.status(409).json({ message: 'Email already in use' });
            }
        }
        const user = await (0, userService_1.registerUser)({
            email: body.email,
            walletAddress: walletLower,
        });
        const token = (0, jwt_1.signToken)({ userId: user.id, role: user.role });
        return res.status(201).json({ token, user });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Invalid payload', errors: err.errors });
        }
        // eslint-disable-next-line no-console
        console.error('Wallet connect error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
