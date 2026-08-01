import type { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { BaseController } from '@/core/base/base.controller.js';
import { UsersService } from './users.service.js';

/**
 * HTTP controller for Users.
 */
@injectable()
export class UsersController extends BaseController<any, any> {
  constructor(@inject(UsersService) private usersService: UsersService) {
    super(usersService, 'users');
  }

  public getProfile = async (req: Request, res: Response): Promise<void> => {
    const profile = await this.usersService.getProfile(req.user?.id);

    res.build
      .withStatus(200)
      .withMessage('user.profile.retrieved')
      .withData(profile)
      .success();

    res.build
      .withStatus(200)
      .withMessage('user.profile.retrieved')
      .withData(profile)
      .success();
  };
}
