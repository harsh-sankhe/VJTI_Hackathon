require('dotenv').config();
const pool = require('./src/config/db');

async function run() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS user_daily_activity (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
        xp_gained INT DEFAULT 0,
        problems_solved INT DEFAULT 0,
        UNIQUE(user_id, activity_date)
      );
    `;
    await pool.query(query);
    console.log('user_daily_activity table created.');
  } catch(e) {
    console.error('Error:', e);
  } finally {
    pool.end();
  }
}
run();
