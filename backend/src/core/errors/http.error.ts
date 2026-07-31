import { z } from "zod";
import { AppError } from "./domain.error.js";

interface ValidationIssue {
  field: string;
  message: string;
}

export class ValidationError extends AppError {
  public readonly errors: ValidationIssue[];

  constructor(message: string, errors: ValidationIssue[] = []) {
    super(message, 422, "VALIDATION_ERROR", true, { errors });
    this.errors = errors;
  }

  static fromZod(zodError: z.ZodError): ValidationError {
    const errors: ValidationIssue[] = zodError.issues.map((issue) => ({
      field: issue.path.join(".") || "(root)",
      message: issue.message,
    }));
    return new ValidationError("Validation failed", errors);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND", true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "UNAUTHORIZED", true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "You do not have permission to perform this action") {
    super(message, 403, "FORBIDDEN", true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists", extra: Record<string, unknown> = {}) {
    super(message, 409, "CONFLICT", true, extra);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad request", extra: Record<string, unknown> = {}) {
    super(message, 400, "BAD_REQUEST", true, extra);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = "Too many requests", retryAfterSeconds?: number) {
    super(message, 429, "TOO_MANY_REQUESTS", true, retryAfterSeconds ? { retryAfterSeconds } : {});
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500, "INTERNAL_SERVER_ERROR", false);
  }
}

export const ErrorFactory = {
  validation: (message: string, errors?: ValidationIssue[]) => new ValidationError(message, errors),
  notFound: (resource?: string) => new NotFoundError(resource),
  unauthorized: (message?: string) => new UnauthorizedError(message),
  forbidden: (message?: string) => new ForbiddenError(message),
  conflict: (message?: string, extra?: Record<string, unknown>) => new ConflictError(message, extra),
  badRequest: (message?: string, extra?: Record<string, unknown>) => new BadRequestError(message, extra),
  tooManyRequests: (message?: string, retryAfterSeconds?: number) =>
    new TooManyRequestsError(message, retryAfterSeconds),
  internal: (message?: string) => new InternalServerError(message),
} as const;