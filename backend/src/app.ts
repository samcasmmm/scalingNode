import express, { Application, RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import { Security } from './core/config/security.config.js';
import { observability } from './core/config/observability.config.js';
import { notFoundMiddleware } from './core/middlewares/not-found.middleware.js';
import { errorHandlerMiddleware } from './core/middlewares/error.middleware.js';
import publicRouter from './routes/public.routes.js';
import authenticatedRouter from './routes/authenticated.routes.js';

class App {
  public readonly instance: Application;
  public readonly security: Security;

  public getInstance(): Application {
    return this.instance;
  }

  constructor() {
    this.instance = express();
    this.security = new Security();
    this.initializeParsers();
    this.initializeSecurity();
    this.initializeObservability();
    this.initializeMiddleWares();
    this.initializePublicRoutes();
    this.initializePrivateRoutes();
    this.initializeErrorHandling();
  }

  private initializeParsers(): void {
    this.instance.use(
      express.json({
        limit: '10mb',
        strict: true,
        type: 'application/json',
      }),
    );

    this.instance.use(
      express.urlencoded({
        extended: true,
        limit: '10mb',
        parameterLimit: 1000,
      }),
    );
  }
  private initializeSecurity(): void {
    this.instance.set(this.security.PROXY_SETTING, this.security.PROXY_VALUE);
    this.instance.use(helmet(this.security.HELMET_OPTIONS));
    this.instance.use(hpp());
    this.instance.use(cors(this.security.CORS_OPTIONS));
    this.instance.use(rateLimit(this.security.RATE_LIMIT_OPTIONS));
    this.instance.disable(this.security.X_POWERED_BY);
  }
  private initializeObservability(): void {
    this.instance.use(observability);
  }
  private initializeMiddleWares(): void {
    this.instance.use(rateLimit);
  }
  private initializePublicRoutes(): void {
    this.instance.use('/api/v1/public', publicRouter);
  }
  private initializePrivateRoutes(): void {
    this.instance.use('/api/v1', authenticatedRouter);
  }
  private initializeErrorHandling(): void {
    this.instance.use(notFoundMiddleware);
    this.instance.use(errorHandlerMiddleware);
  }
}

export default App;
export const appInstance = new App();
export const app = appInstance.getInstance();
