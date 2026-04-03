const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const pool = require('../config/db');

async function patchBalance() {
  try {
    const squadId = 3;
    console.log(`Balancing challenges for Squad ID: ${squadId}`);

    // Update existing active challenges to 'replaced'
    await pool.query(
      "UPDATE squad_challenges SET status = 'replaced' WHERE squad_id = $1 AND status = 'active'",
      [squadId]
    );

    // Find DP Blitz (coding)
    const dpChall = await pool.query(
      "SELECT id FROM challenges WHERE title = 'DP Hard Blitz' LIMIT 1"
    );
    
    // Find SQL Joins Mastery (non-coding)
    const sqlChall = await pool.query(
      "SELECT id FROM challenges WHERE title = 'SQL Joins Mastery' LIMIT 1"
    );

    if (dpChall.rows.length > 0) {
      await pool.query(
        "INSERT INTO squad_challenges (squad_id, challenge_id, expires_at, status) VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '7 days', 'active')",
        [squadId, dpChall.rows[0].id]
      );
      console.log("✅ Added DP Hard Blitz (Coding)");
    } else {
      console.log("❌ DP Hard Blitz challenge not found.");
    }

    if (sqlChall.rows.length > 0) {
      await pool.query(
        "INSERT INTO squad_challenges (squad_id, challenge_id, expires_at, status) VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '7 days', 'active')",
        [squadId, sqlChall.rows[0].id]
      );
      console.log("✅ Added SQL Joins Mastery (Non-coding)");
    } else {
      console.log("❌ SQL Joins Mastery challenge not found.");
    }

    console.log("Success! Squad 3 is now balanced.");
  } catch (err) {
    console.error("Error patching squad balance:", err);
  } finally {
    pool.end();
  }
}

patchBalance();
