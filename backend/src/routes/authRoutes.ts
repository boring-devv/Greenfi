import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  registerUser,
  verifyUserPassword,
  findUserByEmail,
  findUserByWallet,
} from '../services/userService';
import { signToken } from '../utils/jwt';

const router = Router();

const registerSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).max(32).optional(),
  password: z.string().min(6),
  walletAddress: z.string().min(1).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const walletConnectSchema = z.object({
  walletAddress: z.string().min(1),
  email: z.string().email().optional(),
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);

    if (!body.email && !body.walletAddress) {
      return res.status(400).json({ message: 'email or walletAddress is required' });
    }

    if (body.email) {
      const existingByEmail = await findUserByEmail(body.email);
      if (existingByEmail) {
        return res.status(409).json({ message: 'Email already in use' });
      }
    }

    if (body.walletAddress) {
      const existingByWallet = await findUserByWallet(body.walletAddress);
      if (existingByWallet) {
        return res.status(409).json({ message: 'Wallet already connected' });
      }
    }

    const user = await registerUser(body);
    const token = signToken({ userId: user.id, role: user.role });

    return res.status(201).json({ token, user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid payload', errors: err.errors });
    }
    // eslint-disable-next-line no-console
    console.error('Register error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await verifyUserPassword(body.email, body.password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken({ userId: user.id, role: user.role });
    return res.json({ token, user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid payload', errors: err.errors });
    }
    // eslint-disable-next-line no-console
    console.error('Login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/wallet/connect', async (req: Request, res: Response) => {
  try {
    const body = walletConnectSchema.parse(req.body);
    const walletLower = body.walletAddress.toLowerCase();

    const existingByWallet = await findUserByWallet(walletLower);
    if (existingByWallet) {
      const token = signToken({ userId: existingByWallet.id, role: existingByWallet.role });
      return res.json({ token, user: existingByWallet });
    }

    if (body.email) {
      const existingByEmail = await findUserByEmail(body.email);
      if (existingByEmail) {
        return res.status(409).json({ message: 'Email already in use' });
      }
    }

    const user = await registerUser({
      email: body.email,
      walletAddress: walletLower,
    });
    const token = signToken({ userId: user.id, role: user.role });

    return res.status(201).json({ token, user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid payload', errors: err.errors });
    }
    // eslint-disable-next-line no-console
    console.error('Wallet connect error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
