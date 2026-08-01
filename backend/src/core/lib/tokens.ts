import jwt from 'jsonwebtoken';
import env from '@/core/config/env.config.js';

export interface DecodedToken {
  id: number;
  userName?: string;
  email?: string;
  tenantId?: number;
  organizationId?: number;
  branchId?: number;
  [key: string]: any;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenPayload {
  userId: number;
}

export interface EmailVerificationPayload {
  userId: number;
  email: string;
}

export interface PasswordResetPayload {
  userId: number;
}

// ---------- Access / Refresh ----------

export function issueTokens(payload: DecodedToken): TokenPair {
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRATION,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(
    { userId: payload.id },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRATION,
    } as jwt.SignOptions,
  );

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): DecodedToken {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as DecodedToken;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

// ---------- Email verification ----------

export function issueEmailVerificationToken(
  payload: EmailVerificationPayload,
): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: '24h',
  } as jwt.SignOptions);
}

export function verifyEmailVerificationToken(
  token: string,
): EmailVerificationPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as EmailVerificationPayload;
}

// ---------- Password reset ----------

export function issuePasswordResetToken(payload: PasswordResetPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: '30m',
  } as jwt.SignOptions);
}

export function verifyPasswordResetToken(token: string): PasswordResetPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as PasswordResetPayload;
}

// ---------- Utilities ----------

/** Decode without verifying signature/expiry — for logging or reading claims from an untrusted token */
export function decodeTokenUnsafe<T = Record<string, unknown>>(
  token: string,
): T | null {
  const decoded = jwt.decode(token);
  return decoded as T | null;
}

export function isTokenExpiredError(
  err: unknown,
): err is jwt.TokenExpiredError {
  return err instanceof jwt.TokenExpiredError;
}

export function isTokenInvalidError(
  err: unknown,
): err is jwt.JsonWebTokenError {
  return (
    err instanceof jwt.JsonWebTokenError &&
    !(err instanceof jwt.TokenExpiredError)
  );
}
