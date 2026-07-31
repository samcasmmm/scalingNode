import { inject, injectable } from 'tsyringe';
import { BaseService } from '@/core/base/base.service.js';
import { UsersRepository } from './users.repository.js';

/**
 * Business logic service for Users.
 * Extends BaseService for default CRUD orchestration over BaseRepository.
 * Add domain rules, external integrations, transactions, and event emission below.
 */
@injectable()
export class UsersService extends BaseService<any, any> {
  constructor(@inject(UsersRepository) usersRepository: UsersRepository) {
    super(usersRepository, 'Users');
  }

  // Add domain business logic and custom service methods here
}
