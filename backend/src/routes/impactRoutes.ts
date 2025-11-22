import { Router, Request, Response } from 'express';
import { getUserImpact, getImpactLeaderboard, getProjectImpact } from '../services/impactService';

const router = Router();

router.get('/user/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    if (!wallet) {
      return res.status(400).json({ message: 'wallet is required' });
    }
    const data = await getUserImpact(wallet);
    res.json(data);
  } catch (err) {
    console.error('Get user impact error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const limitParam = req.query.limit as string | undefined;
    const limit = limitParam ? Number(limitParam) : 20;
    const leaderboard = await getImpactLeaderboard(Number.isFinite(limit) && limit > 0 ? limit : 20);
    res.json({ leaderboard });
  } catch (err) {
    console.error('Get impact leaderboard error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/project/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'project id is required' });
    }
    const data = await getProjectImpact(id);
    res.json(data);
  } catch (err) {
    console.error('Get project impact error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
