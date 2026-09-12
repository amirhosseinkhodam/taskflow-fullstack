import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { Client } from 'pg';
import * as bcrypt from 'bcryptjs';
import { ADMIN, SUPER_ADMIN } from './api';

const ROOT = join(__dirname, '..', '..');

const DB_NAME = process.env.E2E_PGDATABASE ?? 'taskflow_e2e';

const PG = {
  host: process.env.PGHOST ?? 'localhost',
  port: Number(process.env.PGPORT ?? 5432),
  user: process.env.PGUSER ?? 'postgres',
  password: process.env.PGPASSWORD ?? 'postgres',
};

function databaseUrl(database: string): string {
  const user = encodeURIComponent(PG.user);
  const password = encodeURIComponent(PG.password);
  return `postgresql://${user}:${password}@${PG.host}:${PG.port}/${database}`;
}

async function resetDatabase(): Promise<void> {
  const admin = new Client({ ...PG, database: 'postgres' });
  await admin.connect();
  try {
    await admin.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity
       WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [DB_NAME],
    );
    await admin.query(`DROP DATABASE IF EXISTS "${DB_NAME}"`);
    await admin.query(`CREATE DATABASE "${DB_NAME}"`);
  } finally {
    await admin.end();
  }
}

function applyMigrations(): void {
  execFileSync(
    process.execPath,
    [
      join(ROOT, 'node_modules', 'prisma', 'build', 'index.js'),
      'migrate',
      'deploy',
      '--schema',
      join(ROOT, 'backend', 'prisma', 'schema.prisma'),
    ],
    {
      cwd: ROOT,
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl(DB_NAME) },
    },
  );
}

async function seedPrivilegedUsers(): Promise<void> {
  const client = new Client({ ...PG, database: DB_NAME });
  await client.connect();
  try {
    for (const [account, role] of [
      [ADMIN, 'admin'],
      [SUPER_ADMIN, 'superAdmin'],
    ] as const) {
      const hashed = await bcrypt.hash(account.password, 10);
      await client.query(
        `INSERT INTO users (email, password, "firstName", "lastName", role)
         VALUES ($1, $2, '', '', $3)
         ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password,
                                           role = EXCLUDED.role`,
        [account.email, hashed, role],
      );
    }
  } finally {
    await client.end();
  }
}

export default async function globalSetup(): Promise<void> {
  await prepareDatabase();
}

export async function prepareDatabase(): Promise<void> {
  await resetDatabase();
  applyMigrations();
  await seedPrivilegedUsers();
}

if (require.main === module) {
  prepareDatabase().catch((error) => {
    console.error('E2E database preparation failed:', error);
    process.exit(1);
  });
}
