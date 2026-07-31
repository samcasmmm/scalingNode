import { inject, injectable } from 'tsyringe';
import { BaseController } from '@/core/base/base.controller.js';
import { UsersService } from './users.service.js';

/**
 * HTTP controller for Users.
 * Extends BaseController for standard list, getById, create, update, and remove actions.
 * Add custom HTTP request handlers and endpoint logic below.
 */
@injectable()
export class UsersController extends BaseController<any, any> {
  constructor(@inject(UsersService) usersService: UsersService) {
    super(usersService, 'users');
  }

  // Add custom HTTP request handlers here
}
