import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import stakeRoutes from './routes/stakeRoutes';
import projectRoutes from './routes/projectRoutes';
import impactRoutes from './routes/impactRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'greenfi-backend' });
});

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/stake', stakeRoutes);
app.use('/projects', projectRoutes);
app.use('/impact', impactRoutes);
app.use('/admin', adminRoutes);

app.use(errorHandler);

export default app;
