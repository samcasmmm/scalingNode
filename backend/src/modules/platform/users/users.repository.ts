import { injectable } from 'tsyringe';
import { BaseRepository } from '@/core/base/base.repository.js';
import { usersTable, type User, type NewUser } from '@/database/index.js';

/**
 * Data access repository for Users.
 */
@injectable()
export class UsersRepository extends BaseRepository<
  typeof usersTable,
  User,
  NewUser
> {
  constructor() {
    super(usersTable);
  }
}
