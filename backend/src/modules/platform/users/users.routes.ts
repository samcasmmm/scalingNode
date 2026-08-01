import { Router } from 'express';
import { container } from 'tsyringe';
import { buildCrudRouter } from '@/core/base/base.route.js';
import { createUsersSchema, updateUsersSchema } from './users.validation.js';
import { UsersController } from './users.controller.js';

const router: Router = Router();
const controller = container.resolve(UsersController);

router.get('/me', controller.getProfile);

router.use(
  '/',
  buildCrudRouter(controller, {
    permissionKey: 'core.users',
    createSchema: createUsersSchema as any,
    updateSchema: updateUsersSchema as any,
  }),
);

export default router;
