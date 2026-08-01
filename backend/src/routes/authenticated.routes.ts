import { Router } from 'express';
import { authMiddleware } from '@/core/middlewares/auth.middleware.js';
import usersRouter from '@/modules/platform/users/users.routes.js';

const authenticatedRouter = Router();

// Mount authenticated module routers below
authenticatedRouter.use('/users', usersRouter);

export default authenticatedRouter;
