import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { clog } from '../shared/utils/console.utils.js';

export const ENV_ENUMS = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  TEST: 'test',
} as const;

export type EnvType = (typeof ENV_ENUMS)[keyof typeof ENV_ENUMS];

const ENV_FILE_MAP: Record<EnvType, string> = {
  [ENV_ENUMS.PRODUCTION]: 'env/.env.prod',
  [ENV_ENUMS.TEST]: 'env/.env.test',
  [ENV_ENUMS.DEVELOPMENT]: 'env/.env.dev',
};

const RAW_NODE_ENV = (process.env.NODE_ENV as EnvType) || ENV_ENUMS.DEVELOPMENT;
const ENV_FILE_PATH =
  ENV_FILE_MAP[RAW_NODE_ENV] ?? ENV_FILE_MAP[ENV_ENUMS.DEVELOPMENT];

dotenv.config({
  path: path.resolve(process.cwd(), ENV_FILE_PATH),
  override: true,
});

const envSchema = z.object({
  // --- Server Environment ---
  NODE_ENV: z
    .enum([ENV_ENUMS.DEVELOPMENT, ENV_ENUMS.PRODUCTION, ENV_ENUMS.TEST])
    .default(ENV_ENUMS.DEVELOPMENT),
  PORT: z
    .string()
    .default('3000')
    .transform((val) => parseInt(val, 10)),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // --- Database Configuration ---
  DATABASE_URL: z.string(),
  DB_POOL_MAX: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10)),
  DB_POOL_MIN: z
    .string()
    .optional()
    .default('2')
    .transform((val) => parseInt(val, 10)),

  // --- Authentication & JWT Settings ---
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRATION: z.string().default('24h'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),

  // --- Email Service (SMTP) Settings ---
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z
    .string()
    .default('587')
    .transform((val) => parseInt(val, 10)),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  MAIL_FROM: z.string().optional(),

  // --- AWS / S3 Configuration ---
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),

  // --- RabbitMQ Message Broker Settings ---
  RABBITMQ_ENABLED: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),
  RABBITMQ_HOST: z.string().optional().default('localhost'),
  RABBITMQ_PORT: z
    .string()
    .optional()
    .default('5672')
    .transform((val) => parseInt(val, 10)),
  RABBITMQ_USER: z.string().optional().default('guest'),
  RABBITMQ_PASSWORD: z.string().optional().default('guest'),
  RABBITMQ_VHOST: z.string().optional().default('/'),
  RABBITMQ_MAX_RECONNECT_ATTEMPTS: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10)),
  RABBITMQ_PREFETCH: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10)),

  // --- Redis Cache / Store Settings ---
  REDIS_ENABLED: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),
  REDIS_HOST: z.string().optional().default('localhost'),
  REDIS_PORT: z
    .string()
    .optional()
    .default('6379')
    .transform((val) => parseInt(val, 10)),
  REDIS_PASSWORD: z.string().optional().default(''),

  // --- Security Settings ---
  FRONTEND_URL: z.string().default('').optional(),
});

// -----------------------------------------------------------------------------
// Schema Validation & Execution Guard
// -----------------------------------------------------------------------------
const parsed = envSchema.safeParse(process.env);

if (parsed.success) {
  clog.success('Environment variables loaded successfully');
}
if (!parsed.success) {
  console.error('❌ Environment validation failed:', parsed.error.format());
  process.exit(1);
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------
/** Validated application environment object */
export const env = parsed.data;

/** Environment helper flags based on validated environment */
export const environment = {
  PRODUCTION: env.NODE_ENV === ENV_ENUMS.PRODUCTION,
  DEVELOPMENT: env.NODE_ENV === ENV_ENUMS.DEVELOPMENT,
  TEST: env.NODE_ENV === ENV_ENUMS.TEST,
};

export default env;
