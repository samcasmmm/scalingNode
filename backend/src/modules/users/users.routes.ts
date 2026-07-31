import { Router } from 'express';
import { container } from 'tsyringe';
import { buildCrudRouter } from '@/core/base/base.route.js';
import { createUsersSchema, updateUsersSchema } from './users.validation.js';
import { UsersController } from './users.controller.js';

const router: Router = Router();
const controller = container.resolve(UsersController);

/**
 * Users API routes.
 * Automatically mounts CRUD endpoints via buildCrudRouter:
 * GET / (list), POST / (create), GET /:id, PATCH /:id, DELETE /:id
 * Add custom route definitions below.
 */
router.use(
  '/',
  buildCrudRouter(controller, {
    permissionKey: '.users',
    createSchema: createUsersSchema as any,
    updateSchema: updateUsersSchema as any,
  }),
);

// Add custom routes here, e.g.:
// router.get('/custom-endpoint', controller.customHandler);

export default router;
