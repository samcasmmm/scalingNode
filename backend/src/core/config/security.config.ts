import { CorsOptions } from 'cors';
import rateLimit from 'express-rate-limit';
import env from './env.config.js';

export class Security {
  public readonly FRONTEND_URL_RAW = env.FRONTEND_URL ?? '';
  public readonly ALLOWED_ORIGINS: string[] = this.FRONTEND_URL_RAW.split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  public readonly HELMET_OPTIONS = {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-site' as const },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  };

  public readonly CORS_OPTIONS: CorsOptions = {
    origin: (origin, callback) => {
      if (!origin || this.ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  };

  public readonly RATE_LIMIT_OPTIONS = {
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8' as const,
    legacyHeaders: false,
  };

  public readonly X_POWERED_BY = 'x-powered-by';
  public readonly PROXY_SETTING = 'trust proxy';
  public readonly PROXY_VALUE = 1;
}
