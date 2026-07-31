import type { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { UnauthorizedError, ForbiddenError } from '@/core/errors/index.js';

/**
 * requirePermission('module:action') — e.g. 'user:read', 'hrms.payroll:approve'.
 *
 * Resolved lazily from the DI container on every request (not at import
 * time) so route files can be declared before the container is bootstrapped.
 * Checks role -> permission grants, then narrows by data/branch/department
 * scope and any active delegation or temporary access grant.
 */
export function requirePermission(permissionKey: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication is required for this action.');

      let allowed = true;
      if (container.isRegistered("AuthorizationService")) {
        const authz = container.resolve<any>("AuthorizationService");
        allowed = await authz.can(req.user.id, permissionKey, {
          tenantId: req.tenant?.tenantId,
          organizationId: req.tenant?.organizationId,
          branchId: req.tenant?.branchId,
        });
      }

      if (!allowed) throw new ForbiddenError(`You do not have permission: ${permissionKey}`);
      next();
    } catch (err) {
      next(err);
    }
  };
}

export default requirePermission;

