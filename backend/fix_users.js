require('dotenv').config();
const pool = require('./src/config/db');
async function fix() {
  await pool.query("ALTER TABLE public.users ADD COLUMN IF NOT EXISTS app_role VARCHAR(20) DEFAULT 'user';");
  await pool.query("ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);");
  console.log('Columns added!');
  process.exit(0);
}
fix();
