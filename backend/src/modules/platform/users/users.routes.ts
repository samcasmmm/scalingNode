import { Router } from 'express';
import { container } from 'tsyringe';
import { createUsersSchema } from './users.validation.js';
import { UsersController } from './users.controller.js';
import { validate } from '@/core/middlewares/validate.middleware.js';

const router: Router = Router();
const controller = container.resolve(UsersController);

// POST   /sign-up
router.post(
  '/sign-up',
  validate({ body: createUsersSchema }),
  controller.create,
);

export default router;
