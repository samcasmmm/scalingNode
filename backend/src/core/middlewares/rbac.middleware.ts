import type { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { UnauthorizedError, ForbiddenError } from '@/core/errors/index.js';
import { clog } from '@/core/shared/utils/console.utils.js';

export type PermissionKey = `${string}:${string}`;

export interface ScopeContext {
   tenantId?: number;
   organizationId?: number;
   branchId?: number;
}

export interface AuthorizationService {
   can(userId: number, permissionKey: string, scope?: ScopeContext): Promise<boolean>;
}

/**
 * requirePermission('module:action') — e.g. 'user:read', 'hrms.payroll:approve'.
 *
 * Reads tenant scope from req.user (populated by authMiddleware from the JWT),
 * NOT req.tenant — authMiddleware never sets req.tenant, so reading from it
 * silently sends undefined scope into every check.
 */
export function requirePermission(permissionKey: PermissionKey) {
   return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
         if (!req.user) throw new UnauthorizedError('Authentication is required for this action.');

         let allowed = true;
         if (container.isRegistered('AuthorizationService')) {
            const authz = container.resolve<AuthorizationService>('AuthorizationService');
            const scope: ScopeContext = {
               tenantId: req.user.tenantId,
               organizationId: req.user.organizationId,
               branchId: req.user.branchId,
            };

            allowed = await authz.can(req.user.id, permissionKey, scope);

            if (!allowed) {
               clog.warn('Authorization denied', {
                  userId: req.user.id,
                  permissionKey,
                  scope,
                  path: req.originalUrl,
                  method: req.method,
               });
            }
         }

         if (!allowed) {
            throw new ForbiddenError(`You do not have permission: ${permissionKey}`);
         }

         next();
      } catch (err) {
         next(err);
      }
   };
}

export default requirePermission;