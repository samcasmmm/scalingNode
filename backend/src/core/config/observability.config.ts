import pino from 'pino';
import { pinoHttp, Options } from 'pino-http';
import env from './env.config.js';

export const pino_config = pino({
  level: env.LOG_LEVEL || 'info',
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

export const pinoOptions: Options = {
  logger: pino_config,
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
};

export const observability = pinoHttp(pinoOptions);
