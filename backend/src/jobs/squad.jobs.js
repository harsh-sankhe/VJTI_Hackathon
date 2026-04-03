const cron = require('node-cron');
const pool = require('../config/db');

function initJobs(io) {
  // HOURLY: Evaluate Nudge rules
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Evaluating Hourly Nudges');
    try {
      // Very basic rule placeholder due to space complexity 
      // Rule: Inactive streak warnings
      const streaks = await pool.query(`
        SELECT u.id, u.name, sm.squad_id, us.current_streak 
        FROM squad_members sm 
        JOIN users u ON sm.user_id = u.id
        JOIN code_grind_user_stats us ON us.user_id = CAST(sm.user_id AS VARCHAR)
        WHERE us.current_streak > 0 AND sm.is_active = true
      `);
      
      // In a real system, we look at the last login timestamp. 
      // Simplified: Just broadcast to squad if streak > 3
      for (const st of streaks.rows) {
         if(st.current_streak > 3) {
             const msg = `${st.name} is on a ${st.current_streak}-day streak! 🔥 Give them a shoutout in chat!`;
             await pool.query(`INSERT INTO nudges (squad_id, target_user_id, type, message) VALUES ($1, $2, $3, $4)`, 
             [st.squad_id, st.id, 'streak_celebration', msg]);
             
             // Optionally trigger socket via IO if passed
             if(io) {
               io.to(`squad_${st.squad_id}`).emit('new_nudge', { message: msg });
             }
         }
      }
    } catch(e) {
       console.error('[CRON] Nudge Error:', e);
    }
  });

  // WEEKLY: Sunday Midnight Report Generation & Variable Reset
  cron.schedule('59 23 * * 0', async () => {
    console.log('[CRON] Generating Weekly Reports & Resetting Squad Goals');
    try {
      const activeSquads = await pool.query('SELECT id, goal_problems, total_xp FROM squads WHERE is_active = true');
      
      for(const sq of activeSquads.rows) {
          // Reset weekly XP for members
          await pool.query('UPDATE squad_members SET xp_this_week = 0 WHERE squad_id = $1', [sq.id]);
          // Reset start/end periods
          await pool.query(`
            UPDATE squads SET 
            goal_period_start = CURRENT_TIMESTAMP, 
            goal_period_end = CURRENT_TIMESTAMP + INTERVAL '7 days' 
            WHERE id = $1
          `, [sq.id]);
          // Assign 2 new challenges that the squad hasn't seen yet
          const freshChall = await pool.query(`
            SELECT id FROM challenges 
            WHERE is_active = true 
            AND id NOT IN (SELECT challenge_id FROM squad_challenges WHERE squad_id = $1)
            ORDER BY RANDOM() LIMIT 2
          `, [sq.id]);

          // Archive old active challenges
          await pool.query(`UPDATE squad_challenges SET status = 'expired' WHERE squad_id = $1 AND status = 'active'`, [sq.id]);

          // Insert the fresh ones
          for(const ch of freshChall.rows) {
             await pool.query(`
               INSERT INTO squad_challenges (squad_id, challenge_id, assigned_at, expires_at, status)
               VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '7 days', 'active')
             `, [sq.id, ch.id]);
          }

          if(io) {
             io.to(`squad_${sq.id}`).emit('system_alert', { message: 'A new week has started! Check your new goals.'});
             if(freshChall.rows.length > 0) {
               io.to(`squad_${sq.id}`).emit('new_nudge', { message: '🔥 You have new squad challenges assigned for this week!'});
             }
          }
      }
    } catch(e) {
      console.error('[CRON] Weekly Reset Error', e);
    }
  });
}

module.exports = initJobs;
