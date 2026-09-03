import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const RETRIES = 10;
const RETRY_DELAY_MS = 2000;

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL ?? '';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD ?? '';

async function ensureSuperAdmin(pool: Pool): Promise<void> {
  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    console.log(
      'Super admin credentials not configured (SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD). Skipping.',
    );
    return;
  }

  const existing = await pool.query(
    'SELECT id, role FROM users WHERE email = $1',
    [SUPER_ADMIN_EMAIL],
  );
  if (existing.rows.length > 0) {
    if (existing.rows[0].role !== 'superAdmin') {
      await pool.query(
        `UPDATE users SET role = 'superAdmin' WHERE email = $1`,
        [SUPER_ADMIN_EMAIL],
      );
      console.log('Super admin role corrected');
    }
    return;
  }

  const hashed = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
  await pool.query(
    `INSERT INTO users (email, password, "firstName", "lastName", role)
     VALUES ($1, $2, $3, $4, $5)`,
    [SUPER_ADMIN_EMAIL, hashed, '', '', 'superAdmin'],
  );
  console.log('Super admin seeded');
}

async function ensureTables(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      "firstName" TEXT,
      "lastName" TEXT,
      "nationalCode" TEXT,
      phone TEXT,
      "birthDate" TEXT,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superAdmin'))
    )
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superAdmin'))
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS "firstName" TEXT
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS "lastName" TEXT
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS "nationalCode" TEXT
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone TEXT
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS "birthDate" TEXT
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `);

  await pool.query(`
    ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

  await pool.query(`
    ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS "userId" INTEGER
  `);

  await pool.query(`
    ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS "assigneeId" INTEGER REFERENCES users(id)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS task_comments (
      id SERIAL PRIMARY KEY,
      "taskId" INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      "userId" INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
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
        await ensureSuperAdmin(pool);
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
