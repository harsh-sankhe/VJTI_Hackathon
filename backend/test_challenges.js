require('dotenv').config();
const pool = require('./src/config/db');
async function test() {
  const squadId = 1; // Assuming user is in squad 1
  const sqChall = await pool.query(`
      SELECT sc.id as squad_challenge_id, c.id as challenge_id, c.type, c.title, c.description, c.xp_reward, c.squad_xp_bonus, sc.expires_at
      FROM squad_challenges sc JOIN challenges c ON sc.challenge_id = c.id
      WHERE sc.squad_id = $1 AND sc.status = 'active'
    `, [squadId]);
  
  console.log("SQUAD CHALLENGES:", sqChall.rows);
  
  for(let ch of sqChall.rows) {
      const tasks = await pool.query(`SELECT * FROM challenge_tasks WHERE challenge_id = $1 ORDER BY task_order`, [ch.challenge_id]);
      console.log("TASKS FOR CHALLENGE", ch.challenge_id, ":", tasks.rows.length);
  }
  process.exit();
}
test();
