import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

export type Database = NodePgDatabase<typeof schema>;

let cachedPool: Pool | null = null;

export function getPool(): Pool {
  if (!cachedPool) {
    cachedPool = new Pool({
      connectionString:
        process.env.DATABASE_URL ?? 'postgres://startinde:startinde@localhost:5432/startinde',
      max: 10,
    });
  }
  return cachedPool;
}

export function createDb(pool: Pool = getPool()): Database {
  return drizzle(pool, { schema });
}

export { schema };
export * from './schema.js';
