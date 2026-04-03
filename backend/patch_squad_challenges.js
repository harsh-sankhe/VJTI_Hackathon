require('dotenv').config();
const pool = require('./src/config/db');

async function patch() {
  try {
    // Find all active squads that have fewer than 2 active challenges
    const squads = await pool.query(`
      SELECT s.id as squad_id
      FROM squads s
      WHERE s.is_active = true
      AND (
        SELECT COUNT(*) FROM squad_challenges sc
        WHERE sc.squad_id = s.id AND sc.status = 'active'
      ) < 2
    `);

    console.log(`Found ${squads.rows.length} squad(s) with fewer than 2 active challenges.`);

    for (const squad of squads.rows) {
      const { squad_id } = squad;

      // Get IDs of challenges already assigned to this squad
      const existingRes = await pool.query(
        `SELECT challenge_id FROM squad_challenges WHERE squad_id = $1 AND status = 'active'`,
        [squad_id]
      );
      const existingIds = existingRes.rows.map(r => r.challenge_id);
      const needed = 2 - existingIds.length;

      if (needed <= 0) continue;

      // Pick 'needed' random challenges not already assigned
      const exclude = existingIds.length > 0 ? existingIds : [0];
      const newChallenges = await pool.query(
        `SELECT id FROM challenges WHERE is_active = true AND id != ALL($1::int[]) ORDER BY RANDOM() LIMIT $2`,
        [exclude, needed]
      );

      for (const ch of newChallenges.rows) {
        await pool.query(`
          INSERT INTO squad_challenges (squad_id, challenge_id, expires_at, status)
          VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '7 days', 'active')
          ON CONFLICT DO NOTHING
        `, [squad_id, ch.id]);
        console.log(`  -> Assigned challenge ${ch.id} to squad ${squad_id}`);
      }
    }

    console.log('Done!');
  } catch(e) {
    console.error('Error:', e);
  } finally {
    pool.end();
  }
}

patch();
