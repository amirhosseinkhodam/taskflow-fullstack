const { execFileSync } = require('child_process');
const path = require('path');
const { buildDatabaseUrl } = require('./db-url');

const schema = path.join(__dirname, '..', 'backend', 'prisma', 'schema.prisma');

try {
  execFileSync(
    process.execPath,
    [
      path.join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js'),
      'migrate',
      'deploy',
      '--schema',
      schema,
    ],
    {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: buildDatabaseUrl() },
    },
  );
} catch {
  console.error(
    'Migration failed. Is the database running and reachable? ' +
      'Check your PG* / DATABASE_URL settings in .env.',
  );
  process.exit(1);
}
