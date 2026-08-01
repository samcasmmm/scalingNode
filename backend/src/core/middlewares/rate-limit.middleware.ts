import type { Request, Response, NextFunction } from 'express';
import type { createClient } from 'redis';
import env from '../config/env.config.js';
import { HTTP_MESSAGE } from '@/core/shared/constants/index.js';
import { TooManyRequestsError } from '../errors/http.error.js';

type RedisClient = ReturnType<typeof createClient>;

interface RateLimiterOptions {
  windowSeconds?: number;
  maxRequests?: number;
  prefix?: string;
}

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 10;

// In-memory fallback store when Redis is disabled or unavailable
const memoryStore = new Map<string, { count: number; expiresAt: number }>();

function handleMemoryLimit(
  key: string,
  windowMs: number,
): { count: number; ttlSeconds: number } {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.expiresAt) {
    const expiresAt = now + windowMs;
    memoryStore.set(key, { count: 1, expiresAt });
    return { count: 1, ttlSeconds: Math.ceil(windowMs / 1000) };
  }

  entry.count += 1;
  const ttlSeconds = Math.max(1, Math.ceil((entry.expiresAt - now) / 1000));
  return { count: entry.count, ttlSeconds };
}

export function createRateLimiter(
  redis?: RedisClient | null,
  options?: RateLimiterOptions,
) {
  const windowSeconds = options?.windowSeconds ?? WINDOW_SECONDS;
  const maxRequests = options?.maxRequests ?? MAX_REQUESTS;
  const prefix = options?.prefix ?? 'rate-limit';

  return async function rateLimiter(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    // req.ip is only trustworthy if `trust proxy` is configured correctly
    // upstream (see security middleware) — otherwise this is spoofable via
    // X-Forwarded-For and the limiter is a no-op.
    const key = `${prefix}:${req.ip}`;

    let count: number;
    let ttlSeconds: number;

    if (env.REDIS_ENABLED && redis?.isReady) {
      try {
        const rawCount = await redis.sendCommand(['INCR', key]);
        count = Number(rawCount);

        if (count === 1) {
          await redis.expire(key, windowSeconds);
          ttlSeconds = windowSeconds;
        } else {
          const ttl = await redis.ttl(key);
          ttlSeconds = ttl > 0 ? ttl : windowSeconds;
        }
      } catch (err) {
        req.log?.error(
          { err },
          'Rate limiter Redis call failed — falling back to memory',
        );
        const resMem = handleMemoryLimit(key, windowSeconds * 1000);
        count = resMem.count;
        ttlSeconds = resMem.ttlSeconds;
      }
    } else {
      const resMem = handleMemoryLimit(key, windowSeconds * 1000);
      count = resMem.count;
      ttlSeconds = resMem.ttlSeconds;
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));

    if (count > maxRequests) {
      res.setHeader('Retry-After', ttlSeconds);
      throw new TooManyRequestsError(HTTP_MESSAGE.RATE_LIMIT.EXCEEDED);
    }

    next();
  };
}
