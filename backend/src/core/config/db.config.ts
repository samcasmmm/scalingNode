import { Pool, type PoolConfig } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import env, { environment } from '@/core/config/env.config.js';
import * as schema from '@/database/index.js';

const poolConfig: PoolConfig = {
   connectionString: env.DATABASE_URL,
   max: 20,
   min: 2,
   idleTimeoutMillis: 30_000,
   connectionTimeoutMillis: 5_000,
   statement_timeout: 15_000,
   query_timeout: 15_000,
   ssl: environment.PRODUCTION ? { rejectUnauthorized: false } : undefined,
};

export const pool = new Pool(poolConfig);

// Pool-level errors on idle clients would otherwise crash the process silently
pool.on('error', (err) => {
   console.error('[db] Unexpected error on idle client', err);
});

if (environment.PRODUCTION) {
   pool.on('connect', () => {
      console.debug('[db] New client connected to pool');
   });
}

export const db: NodePgDatabase<typeof schema> = drizzle(pool, {
   schema,
   logger: !environment.PRODUCTION,
});

export const checkDbHealth = async (): Promise<boolean> => {
   try {
      const client = await pool.connect();
      try {
         await client.query('SELECT 1');
         return true;
      } finally {
         client.release();
      }
   } catch (err) {
      console.error('[db] Health check failed', err);
      return false;
   }
};

export const closeDb = async (): Promise<void> => {
   try {
      await pool.end();
      console.log('[db] Pool closed gracefully');
   } catch (err) {
      console.error('[db] Error closing pool', err);
   }
};

process.on('SIGTERM', closeDb);
process.on('SIGINT', closeDb);

export default db;