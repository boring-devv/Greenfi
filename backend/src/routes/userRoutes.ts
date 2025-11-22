import { Router, Request, Response } from 'express';
import { findUserById } from '../services/userService';
import { firestore } from '../config/firebase';

const router = Router();

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Get user error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    if (!firestore) {
      return res.status(500).json({ message: 'Firestore not initialized' });
    }

    const user = await findUserById(req.params.id);
    if (!user || !user.walletAddress) {
      return res.status(404).json({ message: 'User or wallet not found' });
    }

    const wallet = user.walletAddress;

    const stakingSnap = await firestore
      .collection('staking')
      .where('walletAddress', '==', wallet)
      .get();

    let totalStaked = 0;
    let totalRewards = 0;

    stakingSnap.forEach((doc) => {
      const data = doc.data() as any;
      totalStaked += Number(data.amount || 0);
      totalRewards += Number(data.rewards || 0);
    });

    const nftSnap = await firestore
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
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Get user stats error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/nfts', async (req: Request, res: Response) => {
  try {
    if (!firestore) {
      return res.status(500).json({ message: 'Firestore not initialized' });
    }

    const user = await findUserById(req.params.id);
    if (!user || !user.walletAddress) {
      return res.status(404).json({ message: 'User or wallet not found' });
    }

    const wallet = user.walletAddress;

    const nftSnap = await firestore
      .collection('impact_nfts')
      .where('walletAddress', '==', wallet)
      .get();

    const nfts = nftSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return res.json({ wallet, nfts });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Get user nfts error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
