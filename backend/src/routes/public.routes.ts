import { Router } from 'express';

const publicRouter = Router();

/**
 * Health check endpoint for load balancers & monitoring
 */
publicRouter.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
  });
});
publicRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Add public routes (e.g. auth login, signup, webhooks) here

export default publicRouter;
