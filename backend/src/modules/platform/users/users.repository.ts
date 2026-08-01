import { injectable } from 'tsyringe';
import { BaseRepository } from '@/core/base/base.repository.js';

/**
 * Data access repository for Users.
 * Extends BaseRepository for automatic CRUD, pagination, and tenant scoping.
 * Add custom Drizzle database queries and complex data operations below.
 */
@injectable()
export class UsersRepository extends BaseRepository<any, any, any> {
  constructor() {
    super(null as any);
  }

  // Add custom database queries here, e.g.:
  // async findByName(name: string) {
  //   return this.findOne(eq((this.table as any).name, name));
  // }
}
