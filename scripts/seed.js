const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const SUPER_ADMIN_EMAIL = 'amirhosseinkhodam@gmail.com';
const SUPER_ADMIN_PASSWORD = 'SuperAdmin123!';

const ADMIN_EMAIL = 'admin@taskflow.com';
const ADMIN_PASSWORD = 'admin123';

async function seed() {
  const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'taskflow',
  });

  try {
    // Super Admin
    const existingSuper = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [SUPER_ADMIN_EMAIL],
    );
    if (existingSuper.rowCount === 0) {
      const hashed = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
      await pool.query(
        `INSERT INTO users (email, password, "firstName", "lastName", role)
         VALUES ($1, $2, $3, $4, $5)`,
        [SUPER_ADMIN_EMAIL, hashed, 'Amirhossein', 'Khodam', 'superAdmin'],
      );
      console.log(`Super admin created: ${SUPER_ADMIN_EMAIL} / ${SUPER_ADMIN_PASSWORD}`);
    } else {
      console.log(`Super admin "${SUPER_ADMIN_EMAIL}" already exists. Skipping.`);
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
        [ADMIN_EMAIL, hashed, 'Admin', 'User', 'admin'],
      );
      console.log(`Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    } else {
      console.log(`Admin user "${ADMIN_EMAIL}" already exists. Skipping.`);
    }
  } finally {
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
