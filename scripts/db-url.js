const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
  quiet: true,
});

function buildDatabaseUrl(env = process.env) {
  if (env.DATABASE_URL) return env.DATABASE_URL;

  const host = env.PGHOST ?? 'localhost';
  const port = env.PGPORT ?? '5432';
  const user = env.PGUSER ?? 'postgres';
  const password = env.PGPASSWORD ?? 'postgres';
  const database = env.PGDATABASE ?? 'taskflow';

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(
    password,
  )}@${host}:${port}/${database}`;
}

module.exports = { buildDatabaseUrl };

if (require.main === module) {
  process.stdout.write(buildDatabaseUrl());
}
