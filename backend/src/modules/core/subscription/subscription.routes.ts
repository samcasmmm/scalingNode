import { Router } from 'express';
import { container } from 'tsyringe';
import { buildCrudRouter } from '@/core/base/base.route.js';
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
} from './subscription.validation.js';
import { SubscriptionController } from './subscription.controller.js';

const router: Router = Router();
const controller = container.resolve(SubscriptionController);

/**
 * Subscription API routes.
 * Automatically mounts CRUD endpoints via buildCrudRouter:
 * GET / (list), POST / (create), GET /:id, PATCH /:id, DELETE /:id
 * Add custom route definitions below.
 */
router.use(
  '/',
  buildCrudRouter(controller, {
    permissionKey: 'core.subscription',
    createSchema: createSubscriptionSchema as any,
    updateSchema: updateSubscriptionSchema as any,
  }),
);

// Add custom routes here, e.g.:
// router.get('/custom-endpoint', controller.customHandler);

export default router;
