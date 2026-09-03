const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || '';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || '';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@taskflow.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function seed() {
  const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'taskflow',
  });

  try {
    // Super Admin (optional — only seeded if SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are set)
    if (SUPER_ADMIN_EMAIL && SUPER_ADMIN_PASSWORD) {
      const existingSuper = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [SUPER_ADMIN_EMAIL],
      );
      if (existingSuper.rowCount === 0) {
        const hashed = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
        await pool.query(
          `INSERT INTO users (email, password, "firstName", "lastName", role)
           VALUES ($1, $2, $3, $4, $5)`,
          [SUPER_ADMIN_EMAIL, hashed, '', '', 'superAdmin'],
        );
        console.log('Super admin created');
      } else {
        console.log('Super admin already exists. Skipping.');
      }
    } else {
      console.log(
        'Super admin credentials not configured (SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD). Skipping.',
      );
    }

    // Admin
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [ADMIN_EMAIL],
    );
    if (existingAdmin.rowCount === 0) {
      const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await pool.query(
        `INSERT INTO users (email, password, "firstName", "lastName", role)
         VALUES ($1, $2, $3, $4, $5)`,
        [ADMIN_EMAIL, hashed, '', '', 'admin'],
      );
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists. Skipping.');
    }
  } finally {
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
