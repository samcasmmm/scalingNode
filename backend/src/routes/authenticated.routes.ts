import { Router } from 'express';
import { authMiddleware } from '@/core/middlewares/auth.middleware.js';
// import usersRouter from '@/modules/users/users.routes.js';

const authenticatedRouter = Router();

// Apply authentication guard to all routes mounted in this router
authenticatedRouter.use(authMiddleware);

// Mount authenticated module routers below
// authenticatedRouter.use('/users', usersRouter);

export default authenticatedRouter;
