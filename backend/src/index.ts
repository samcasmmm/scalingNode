import 'reflect-metadata';
import http from 'http';
import env from '@/core/config/env.config.js';
import { app } from '@/app.js';
import { clog } from '@/core/shared/utils/console.utils.js';
import { closeDb } from '@/core/config/db.config.js';

export class Server {
  private readonly PORT: number = 5000;
  private readonly SERVER: http.Server;
  private shuttingDown: boolean = false;

  constructor() {
    this.PORT = env.PORT;
    this.SERVER = http.createServer(app);
    this.registerProcessEvents();
    this.registerServerEvents();
  }

  public start() {
    this.SERVER.listen(this.PORT);
  }
  public stop() {
    this.SERVER.close(() => {
      console.log('[Server closed]');
    });
  }

  private registerServerEvents(): void {
    this.SERVER.on('listening', this.onListening);
    this.SERVER.on('error', this.onError);
  }

  private registerProcessEvents() {
    process.once('SIGINT', () => {
      this.shutdown('SIGINT');
    });
    process.once('SIGTERM', () => {
      this.shutdown('SIGTERM');
    });
    process.once('SIGHUP', () => {
      this.shutdown('SIGHUP');
    });
    process.on('unhandledRejection', (reason) => {
      clog.error('Unhandled Rejection at Promise:', reason);
      this.shutdown('unhandledRejection');
    });
    process.on('uncaughtException', (error) => {
      clog.error('Uncaught Exception:', error);
      this.shutdown('uncaughtException');
    });
  }
  private onListening = () => {
    const server_url = 'http://localhost:' + this.PORT;
    const server_doc_url = 'http://localhost:' + this.PORT + '/api/docs';
    clog.banner(`Server : ${server_url}`);
    clog.banner(`Documentation : ${server_doc_url}`);
  };

  private onError = (error: Error) => {
    clog.error('Server error:', error);
  };

  private shutdown(signal: string) {
    if (this.shuttingDown) return;
    this.shuttingDown = true;
    clog.warn(`${signal} received, terminating server`);

    const timeout = setTimeout(() => {
      clog.warn(`Server forced shutdown after 10 seconds`);
      process.exit(1);
    }, 10000);

    timeout.unref();

    this.SERVER.close(async (err: any) => {
      clearTimeout(timeout);
      if (err) {
        clog.error(`Error during server close: ${err}`);
        process.exit(1);
      }
      try {
        await this.closeDatabase();
        clog.success('Server cleanly shut down');
        process.exit(0);
      } catch (error) {
        clog.error(`Error during server close: ${error}`);
        process.exit(1);
      }
    });
  }

  private async closeDatabase(): Promise<void> {
    clog.info('Closing database connection...');
    try {
      await closeDb();
      clog.success('Database connection closed');
    } catch (error) {
      clog.error('Error closing database connection', error);
      throw error;
    }
  }
}

const server = new Server();
server.start();
