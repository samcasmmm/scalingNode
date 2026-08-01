import { inject, injectable } from 'tsyringe';
import { BaseService } from '@/core/base/base.service.js';
import { UsersRepository } from './users.repository.js';
import { type User, type NewUser, usersTable } from '@/database/index.js';
import { ConflictError } from '@/core/errors/index.js';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcrypt';

/**
 * Business logic service for Users.
 */
@injectable()
export class UsersService extends BaseService<User, NewUser> {
  constructor(
    @inject(UsersRepository) private usersRepository: UsersRepository,
  ) {
    super(usersRepository, 'Users');
  }

  override async create(body: NewUser): Promise<User> {
    // Check if email or username is already taken
    const existing = await this.usersRepository.findOne(
      or(
        eq(usersTable.email, body.email),
        eq(usersTable.username, body.username),
      )!,
    );

    if (existing) {
      if (existing.email === body.email) {
        throw new ConflictError('Email address is already registered');
      }
      if (existing.username === body.username) {
        throw new ConflictError('Username is already taken');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    return this.usersRepository.create({
      ...body,
      password: hashedPassword,
    });
  }

  async getProfile(userId?: number): Promise<User | null> {
    if (!userId) return null;
    return this.usersRepository.findById(userId);
  }
}
