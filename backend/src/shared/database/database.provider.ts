import { Pool } from 'pg';

const RETRIES = 10;
const RETRY_DELAY_MS = 2000;

async function ensureTables(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin'))
    )
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin'))
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      "projectId" INTEGER NOT NULL,
      "position" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("projectId") REFERENCES projects(id)
    )
  `);

  await pool.query(`
    ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS "position" INTEGER NOT NULL DEFAULT 0
  `);
}

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const databaseProvider = {
  provide: 'DATABASE',
  useFactory: async () => {
    const poolConfig: import('pg').PoolConfig = process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL }
      : {
          host: process.env.PGHOST ?? 'localhost',
          port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
          user: process.env.PGUSER ?? 'postgres',
          password: process.env.PGPASSWORD ?? 'postgres',
          database: process.env.PGDATABASE ?? 'taskflow',
        };

    const pool = new Pool(poolConfig);

    pool.on('error', (err) => {
      console.error('Unexpected database pool error', err);
    });

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= RETRIES; attempt++) {
      try {
        const client = await pool.connect();
        client.release();
        await ensureTables(pool);
        console.log('Database connected and tables ensured');
        return pool;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(
          `Database connection attempt ${attempt}/${RETRIES} failed: ${lastError.message}`,
        );
        if (attempt < RETRIES) {
          await wait(RETRY_DELAY_MS);
        }
      }
    }

    throw lastError ?? new Error('Failed to connect to database');
  },
};
