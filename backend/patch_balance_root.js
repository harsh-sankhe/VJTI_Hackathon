require('dotenv').config();
const pool = require('./src/config/db');

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
      "SELECT id FROM challenges WHERE title ILIKE '%DP%Blitz%' LIMIT 1"
    );
    
    // Find SQL Mastery (non-coding)
    const sqlChall = await pool.query(
      "SELECT id FROM challenges WHERE title ILIKE '%SQL%' LIMIT 1"
    );

    if (dpChall.rows.length > 0) {
      await pool.query(
        "INSERT INTO squad_challenges (squad_id, challenge_id, expires_at, status) VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '7 days', 'active')",
        [squadId, dpChall.rows[0].id]
      );
      console.log("✅ Added DP Blitz (Coding)");
    } else {
      console.log("❌ DP challenge not found.");
    }

    if (sqlChall.rows.length > 0) {
      await pool.query(
        "INSERT INTO squad_challenges (squad_id, challenge_id, expires_at, status) VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '7 days', 'active')",
        [squadId, sqlChall.rows[0].id]
      );
      console.log("✅ Added SQL Mastery (Non-coding)");
    } else {
      console.log("❌ SQL challenge not found.");
    }

    console.log("Done.");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

patchBalance();
