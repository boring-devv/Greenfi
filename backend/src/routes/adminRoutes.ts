import { Router, Request, Response } from 'express';
import { firestore } from '../config/firebase';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/authMiddleware';
import { ethers } from 'ethers';
import { getGreenFiCoreWithSigner } from '../web3/greenfiContracts';

const router = Router();

function ensureFirestore(res: Response) {
  if (!firestore) {
    res.status(500).json({ message: 'Firestore not initialized' });
    return false;
  }
  return true;
}

// GET /admin/overview
router.get('/overview', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    if (!ensureFirestore(res)) return;
    const db = firestore!;

    const [usersSnap, stakingSnap, nftsSnap, projectsSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('staking').get(),
      db.collection('impact_nfts').get(),
      db.collection('projects').get(),
    ]);

    let totalStaked = 0;
    let totalRewardsPaid = 0;
    stakingSnap.forEach((doc) => {
      const data = doc.data() as any;
      totalStaked += Number(data.amount || 0);
      totalRewardsPaid += Number(data.rewards || 0);
    });

    let totalCarbonOffset = 0;
    nftsSnap.forEach((doc) => {
      const data = doc.data() as any;
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
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Admin overview error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /admin/impact/mint
router.post('/impact/mint', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const core = getGreenFiCoreWithSigner();
    if (!core) {
      return res.status(500).json({ message: 'Contract not configured' });
    }

    const {
      walletAddress,
      carbonOffset,
      projectName,
      date,
      badgeTier,
      tokenURI,
    } = req.body as {
      walletAddress?: string;
      carbonOffset?: number;
      projectName?: string;
      date?: string;
      badgeTier?: string;
      tokenURI?: string;
    };

    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ message: 'walletAddress is required' });
    }
    if (typeof carbonOffset !== 'number' || !Number.isFinite(carbonOffset) || carbonOffset <= 0) {
      return res.status(400).json({ message: 'carbonOffset must be a positive number' });
    }
    if (!projectName || !projectName.trim()) {
      return res.status(400).json({ message: 'projectName is required' });
    }
    if (!date || !date.trim()) {
      return res.status(400).json({ message: 'date is required' });
    }
    if (!badgeTier || !badgeTier.trim()) {
      return res.status(400).json({ message: 'badgeTier is required' });
    }

    const wallet = walletAddress.toLowerCase();
    const carbonWei = ethers.parseEther(carbonOffset.toString());

    const tx = await core.mintImpactNFTForUser(
      wallet,
      carbonWei,
      projectName.trim(),
      date.trim(),
      badgeTier.trim(),
      (tokenURI || '').trim(),
    );

    const receipt = await tx.wait();

    return res.status(201).json({
      txHash: receipt?.hash ?? tx.hash,
      network: 'hedera-testnet',
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Admin mint impact NFT error', err);
    return res.status(500).json({ message: 'Failed to mint impact NFT' });
  }
});

// GET /admin/users
router.get('/users', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    if (!ensureFirestore(res)) return;
    const db = firestore!;
    const snap = await db.collection('users').orderBy('createdAt', 'desc').limit(200).get();
    const users = snap.docs.map((doc) => doc.data());
    res.json({ users });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Admin users error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /admin/projects
router.get('/projects', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    if (!ensureFirestore(res)) return;
    const db = firestore!;
    const snap = await db.collection('projects').orderBy('projectName').get();
    const projects = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ projects });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Admin projects error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
