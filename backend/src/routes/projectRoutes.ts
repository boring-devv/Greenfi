import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/authMiddleware';
import { listProjects, createProject, approveProject } from '../services/projectService';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const projects = await listProjects();
    res.json({ projects });
  } catch (err) {
    console.error('List projects error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/add', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectName, location, description, fundsRaised, impactScore, status } = req.body as {
      projectName?: string;
      location?: string;
      description?: string;
      fundsRaised?: number;
      impactScore?: number;
      status?: string;
    };

    if (!projectName || typeof projectName !== 'string') {
      return res.status(400).json({ message: 'projectName is required' });
    }

    const project = await createProject({
      projectName,
      location,
      description,
      fundsRaised,
      impactScore,
      status,
    });

    res.status(201).json({ project });
  } catch (err) {
    console.error('Create project error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/approve/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const project = await approveProject(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ project });
  } catch (err) {
    console.error('Approve project error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
