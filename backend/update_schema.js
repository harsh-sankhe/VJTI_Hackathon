require('dotenv').config();
const pool = require('./src/config/db');

async function run() {
  try {
    await pool.query("ALTER TABLE public.users ADD COLUMN IF NOT EXISTS app_role VARCHAR(20) DEFAULT 'user'");
    console.log('Schema updated.');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    pool.end();
  }
}

run();
