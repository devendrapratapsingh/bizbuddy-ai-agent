import { Router } from 'express';
import { prisma } from '@/config/database';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };

    res.status(200).json(health);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/metrics', async (req, res) => {
  try {
    const stats = {
      users: await prisma.user.count(),
      businesses: await prisma.business.count(),
      conversations: await prisma.conversation.count(),
      messages: await prisma.message.count(),
      activeConnections: req.app.locals.activeConnections || 0
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as healthRouter };