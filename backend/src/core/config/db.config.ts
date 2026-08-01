import 'reflect-metadata';
import { Pool, type PoolConfig } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { singleton } from 'tsyringe';
import env, { environment } from '@/core/config/env.config.js';
import * as schema from '@/database/index.js';
import { clog } from '../shared/utils/console.utils.js';

type Schema = typeof schema;

@singleton()
export class Database {
  public readonly pool: Pool;
  public readonly db: NodePgDatabase<Schema>;

  constructor() {
    this.pool = new Pool(this.buildPoolConfig());
    this.registerPoolListeners();

    this.db = drizzle(this.pool, {
      schema,
      logger: !environment.PRODUCTION,
    });
  }

  private buildPoolConfig(): PoolConfig {
    return {
      connectionString: env.DATABASE_URL,
      max: 20,
      min: 2,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      statement_timeout: 15_000,
      query_timeout: 15_000,
      ssl: environment.PRODUCTION ? { rejectUnauthorized: false } : undefined,
    };
  }

  private registerPoolListeners(): void {
    // Pool-level errors on idle clients would otherwise crash the process silently
    this.pool.on('error', (err) => {
      clog.error('[db] Unexpected error on idle client', err);
    });

    if (environment.PRODUCTION) {
      this.pool.on('connect', () => {
        clog.info('[db] New client connected to pool');
      });
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      try {
        await client.query('SELECT 1');
        return true;
      } finally {
        client.release();
      }
    } catch (err) {
      clog.error('[db] Health check failed', err);
      return false;
    }
  }

  async close(): Promise<void> {
    try {
      await this.pool.end();
      clog.success('[db] Pool closed gracefully');
    } catch (err) {
      clog.error('[db] Error closing pool', err);
    }
  }
}

// Module-level singleton instance, so files that just want `db`/`pool`
// (repositories, seed scripts, migration runners) don't need to resolve
// it through the tsyringe container.
export const database = new Database();
export const pool = database.pool;
export const db = database.db;

export const checkDbHealth = () => database.checkHealth();
export const closeDb = () => database.close();

export default db;
