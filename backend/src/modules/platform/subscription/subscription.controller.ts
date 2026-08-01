import { inject, injectable } from 'tsyringe';
import { BaseController } from '@/core/base/base.controller.js';
import { SubscriptionService } from './subscription.service.js';

/**
 * HTTP controller for Subscription.
 * Extends BaseController for standard list, getById, create, update, and remove actions.
 * Add custom HTTP request handlers and endpoint logic below.
 */
@injectable()
export class SubscriptionController extends BaseController<any, any> {
  constructor(
    @inject(SubscriptionService) subscriptionService: SubscriptionService,
  ) {
    super(subscriptionService, 'subscription');
  }

  // Add custom HTTP request handlers here
}
