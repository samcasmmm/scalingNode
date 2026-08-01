import pino from 'pino';
import { pinoHttp, type Options } from 'pino-http';
import type { IncomingMessage, ServerResponse } from 'http';
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
            ignore: 'pid,hostname,req,res',
            singleLine: true,
          },
        }
      : undefined,
});

export const pinoOptions: Options = {
  logger: pino_config,

  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },

  customSuccessMessage(req: IncomingMessage, res: ServerResponse) {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },

  customErrorMessage(req: IncomingMessage, res: ServerResponse, err: Error) {
    return `${req.method} ${req.url} ${res.statusCode} - ${err?.message ?? ''}`;
  },

  serializers: {
    req: () => undefined,
    res: () => undefined,
  },
};

export const observability = pinoHttp(pinoOptions);
