import { Router, Request, Response } from 'express';
import {
  getStakeRate,
  getWalletStakes,
  initiateStake,
  claimStakeRewards,
  withdrawStake,
} from '../services/stakeService';

const router = Router();

router.get('/rate', async (_req: Request, res: Response) => {
  try {
    const rate = await getStakeRate();
    res.json(rate);
  } catch (err) {
    console.error('Get stake rate error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    if (!wallet) {
      return res.status(400).json({ message: 'wallet is required' });
    }
    const data = await getWalletStakes(wallet);
    res.json(data);
  } catch (err) {
    console.error('Get wallet stakes error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/initiate', async (req: Request, res: Response) => {
  try {
    const { walletAddress, amount } = req.body as { walletAddress?: string; amount?: number };
    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ message: 'walletAddress is required' });
    }
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: 'amount must be a positive number' });
    }

    const stake = await initiateStake({ walletAddress, amount });
    res.status(201).json({ stake });
  } catch (err) {
    console.error('Initiate stake error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/claim', async (req: Request, res: Response) => {
  try {
    const { stakeId } = req.body as { stakeId?: string };
    if (!stakeId) {
      return res.status(400).json({ message: 'stakeId is required' });
    }
    const stake = await claimStakeRewards(stakeId);
    if (!stake) {
      return res.status(404).json({ message: 'Stake not found' });
    }
    res.json({ stake });
  } catch (err) {
    console.error('Claim stake rewards error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/withdraw', async (req: Request, res: Response) => {
  try {
    const { stakeId } = req.body as { stakeId?: string };
    if (!stakeId) {
      return res.status(400).json({ message: 'stakeId is required' });
    }
    const stake = await withdrawStake(stakeId);
    if (!stake) {
      return res.status(404).json({ message: 'Stake not found' });
    }
    res.json({ stake });
  } catch (err) {
    console.error('Withdraw stake error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
