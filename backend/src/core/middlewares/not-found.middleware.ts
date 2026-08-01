import { Request, Response, NextFunction } from 'express';

export const notFoundMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  (error as any).statusCode = 404;
  (error as any).errorCode = 'NOT_FOUND';
  (error as any).isOperational = true;
  next(error);
};
