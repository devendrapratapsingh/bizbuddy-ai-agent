import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import { healthRouter } from './health';
import { authRouter } from './auth';
import { conversationsRouter } from './conversations';
import { voiceRouter } from './voice';
import { leadsRouter } from './leads';
import { pipelinesRouter } from './pipelines';
import { businessesRouter } from './businesses';

const router = Router();

// Health check
router.use('/health', healthRouter);

// Authentication
router.use('/auth', authRouter);

// Protected routes - should use authMiddleware from server.ts via app.use
router.use('/api/protected', [
  // Conversations
  conversationsRouter,

  // Voice calls
  voiceRouter,

  // Leads
  leadsRouter,

  // Pipelines
  pipelinesRouter,

  // Businesses
  businessesRouter
]);

// Setup routes function
export const setupRoutes = (
  app: Router,
  prisma: PrismaClient,
  io: Server
) => {
  // Use the API router
  app.use('/api', router);

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

export { router as apiRouter };