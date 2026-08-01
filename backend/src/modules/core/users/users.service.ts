import { inject, injectable } from 'tsyringe';
import { BaseService } from '@/core/base/base.service.js';
import { UsersRepository } from './users.repository.js';

/**
 * Business logic service for Users.
 */
@injectable()
export class UsersService extends BaseService<any, any> {
  constructor(@inject(UsersRepository) usersRepository: UsersRepository) {
    super(usersRepository, 'Users');
  }

  async getProfile(userId?: number) {
    return {
      id: userId ?? 1,
      name: 'System User',
      email: 'user@system.local',
      status: 'active',
    };
  }
}
