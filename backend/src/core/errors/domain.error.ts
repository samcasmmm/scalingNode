type ErrorExtra = Record<string, unknown>;

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly extra: ErrorExtra;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    isOperational: boolean = true,
    extra: ErrorExtra = {},
  ) {
    super(message);

    this.name = this.constructor.name;

    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.extra = extra;
    this.timestamp = new Date().toISOString();

    Object.setPrototypeOf(this, new.target.prototype);
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      isOperational: this.isOperational,
      extra: this.extra,
      timestamp: this.timestamp,
    };
  }
}
export class DomainError extends AppError {
  constructor(
    message: string,
    code: string = 'DOMAIN_ERROR',
    statusCode: number = 400,
    extra: ErrorExtra = {},
  ) {
    super(message, statusCode, code, true, extra);
  }
}
