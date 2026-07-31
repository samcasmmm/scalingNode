import type { Request, Response, NextFunction } from 'express';

/**
 * useModule('moduleName') middleware
 *
 * Sets the module name on the request context so ResponseBuilder
 * automatically includes it in the API response JSON.
 *
 * Usage:
 *   router.use(useModule('auth'));
 *   router.use('/users', useModule('users'), usersRouter);
 */
export function useModule(moduleName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    req.moduleName = moduleName;
    if (res.build) {
      res.build.withModule(moduleName);
    }
    next();
  };
}

export default useModule;
