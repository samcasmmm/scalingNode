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
    if (profile) {
      const { password, ...safeProfile } = profile;
      res.build
        .withStatus(200)
        .withMessage('user.profile.retrieved')
        .withData(safeProfile)
        .success();
      return;
    }

    res.build
      .withStatus(404)
      .withMessage('user.profile.not_found')
      .success();
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    const created = await this.usersService.create(req.body);
    const { password, ...safeUser } = created;

    res.build
      .withStatus(201)
      .withMessage('user.created')
      .withData(safeUser)
      .success();
  };
}
