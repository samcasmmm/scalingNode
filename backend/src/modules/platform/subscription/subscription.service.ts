import { inject, injectable } from 'tsyringe';
import { BaseService } from '@/core/base/base.service.js';
import { SubscriptionRepository } from './subscription.repository.js';

/**
 * Business logic service for Subscription.
 * Extends BaseService for default CRUD orchestration over BaseRepository.
 * Add domain rules, external integrations, transactions, and event emission below.
 */
@injectable()
export class SubscriptionService extends BaseService<any, any> {
  constructor(
    @inject(SubscriptionRepository)
    subscriptionRepository: SubscriptionRepository,
  ) {
    super(subscriptionRepository, 'Subscription');
  }

  // Add domain business logic and custom service methods here
}
