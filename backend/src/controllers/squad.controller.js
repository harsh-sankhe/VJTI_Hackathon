const pool = require('../config/db');

// Utility to generate a random 6-character alphanumeric string
function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

exports.createSquad = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, goal_problems } = req.body;
    
    // Check if user is already in an active squad
    const activeCheck = await pool.query('SELECT squad_id FROM squad_members WHERE user_id = $1 AND is_active = true', [userId]);
    if (activeCheck.rows.length > 0) {
      return res.status(400).json({ error: 'You are already in an active squad. Leave it first to create a new one.' });
    }

    const inviteCode = generateInviteCode();
    
    // Create Squad
    const squadRes = await pool.query(`
      INSERT INTO squads (name, invite_code, leader_id, goal_problems, goal_period_start, goal_period_end)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '7 days')
      RETURNING id, name, invite_code
    `, [name, inviteCode, userId, goal_problems || 25]);
    
    const squad = squadRes.rows[0];

    // Add exactly one leader
    await pool.query(`
      INSERT INTO squad_members (squad_id, user_id, role)
      VALUES ($1, $2, 'leader')
    `, [squad.id, userId]);

    // Auto assign 2 unique challenges
    const challengeRes = await pool.query('SELECT id FROM challenges WHERE is_active = true ORDER BY RANDOM() LIMIT 2');
    for (const ch of challengeRes.rows) {
      await pool.query(`
        INSERT INTO squad_challenges (squad_id, challenge_id, expires_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '7 days')
        ON CONFLICT DO NOTHING
      `, [squad.id, ch.id]);
    }

    res.json({ message: 'Squad created successfully', squad });
  } catch (err) {
    console.error('Create squad error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.joinSquad = async (req, res) => {
  try {
    const userId = req.user.id;
    const { invite_code } = req.body;

    const activeCheck = await pool.query('SELECT squad_id FROM squad_members WHERE user_id = $1 AND is_active = true', [userId]);
    if (activeCheck.rows.length > 0) {
      return res.status(400).json({ error: 'You are already in an active squad. Leave it first.' });
    }

    const squadRes = await pool.query('SELECT id FROM squads WHERE invite_code = $1 AND is_active = true', [invite_code]);
    if (squadRes.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or inactive invite code' });
    }
    const squadId = squadRes.rows[0].id;

    // Check size limit
    const countRes = await pool.query('SELECT COUNT(*) FROM squad_members WHERE squad_id = $1 AND is_active = true', [squadId]);
    if (parseInt(countRes.rows[0].count) >= 10) {
      return res.status(400).json({ error: 'Squad is full (Max 10 members).' });
    }

    await pool.query(`
      INSERT INTO squad_members (squad_id, user_id, role)
      VALUES ($1, $2, 'member')
      ON CONFLICT (squad_id, user_id) 
      DO UPDATE SET is_active = true, joined_at = CURRENT_TIMESTAMP
    `, [squadId, userId]);

    // Record activity
    await pool.query(`INSERT INTO squad_activity_feed (squad_id, user_id, action, item, type) VALUES ($1, $2, 'joined', 'the squad', 'join')`, [squadId, userId]);

    res.json({ message: 'Joined squad successfully' });
  } catch (err) {
    console.error('Join squad error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.leaveSquad = async (req, res) => {
    try {
        const userId = req.user.id;
        
        await pool.query('UPDATE squad_members SET is_active = false WHERE user_id = $1', [userId]);
        
        res.json({ message: 'Left squad successfully' });
    } catch (err) {
        console.error('Leave squad error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find active squad for user
    const squadMemberQuery = await pool.query('SELECT squad_id, role FROM squad_members WHERE user_id = $1 AND is_active = true', [userId]);
    if (squadMemberQuery.rows.length === 0) {
      return res.json({ hasSquad: false });
    }
    
    const squadId = squadMemberQuery.rows[0].squad_id;
    const userRole = squadMemberQuery.rows[0].role;
    
    // 1. Squad Details
    const squadDetails = await pool.query(`
      SELECT * FROM squads WHERE id = $1
    `, [squadId]);
    
    const info = squadDetails.rows[0];

    // 2. Member Leaderboard
    const membersList = await pool.query(`
      SELECT 
        sm.user_id,
        u.name,
        sm.role,
        sm.xp_this_week,
        COALESCE(us.total_xp, 0) as global_xp,
        COALESCE(us.current_streak, 0) as streak,
        (
          SELECT COUNT(*) 
          FROM code_grind_user_progress cgp 
          WHERE cgp.user_id = CAST(sm.user_id AS VARCHAR) 
          AND cgp.status = 'Completed'
          AND cgp.completed_at >= (SELECT goal_period_start FROM squads WHERE id = sm.squad_id)
        ) as total_solved
      FROM squad_members sm
      JOIN users u ON sm.user_id = u.id
      LEFT JOIN code_grind_user_stats us ON us.user_id = CAST(sm.user_id AS VARCHAR)
      WHERE sm.squad_id = $1 AND sm.is_active = true
      ORDER BY sm.xp_this_week DESC
    `, [squadId]);
    
    // 3. Current active challenges overview
    const challengesQuery = await pool.query(`
      SELECT c.id, c.title, c.type, c.xp_reward, c.squad_xp_bonus, sc.expires_at 
      FROM squad_challenges sc 
      JOIN challenges c ON sc.challenge_id = c.id
      WHERE sc.squad_id = $1 AND sc.status = 'active'
    `, [squadId]);

    // 4. Feed
    const feedQuery = await pool.query(`
      SELECT f.*, u.name as user_name 
      FROM squad_activity_feed f
      JOIN users u ON f.user_id = u.id
      WHERE f.squad_id = $1
      ORDER BY f.created_at DESC
      LIMIT 20
    `, [squadId]);

    // Construct response
    res.json({
      hasSquad: true,
      info,
      userRole,
      members: membersList.rows,
      challenges: challengesQuery.rows,
      feed: feedQuery.rows
    });
    
  } catch (err) {
    console.error('Squad Dashboard Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getChallenges = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get squadid
    const sq = await pool.query('SELECT squad_id FROM squad_members WHERE user_id = $1 AND is_active=true', [userId]);
    if(sq.rows.length === 0) return res.status(403).json({error: 'Not in squad'});
    const squadId = sq.rows[0].squad_id;

    // Get active challenges for context
    const sqChall = await pool.query(`
      SELECT sc.id as squad_challenge_id, c.id as challenge_id, c.type, c.title, c.description, c.xp_reward, c.squad_xp_bonus, sc.expires_at
      FROM squad_challenges sc JOIN challenges c ON sc.challenge_id = c.id
      WHERE sc.squad_id = $1 AND sc.status = 'active'
    `, [squadId]);

    const result = [];
    for(let ch of sqChall.rows) {
      // Get Tasks
      const tasks = await pool.query(`SELECT * FROM challenge_tasks WHERE challenge_id = $1 ORDER BY task_order`, [ch.challenge_id]);
      // Get member progress grid
      const prog = await pool.query(`SELECT user_id, task_id, status, approach_text FROM member_challenge_progress WHERE squad_id = $1 AND challenge_id = $2`, [squadId, ch.challenge_id]);
      
      result.push({
        ...ch,
        tasks: tasks.rows,
        progressGrid: prog.rows
      });
    }

    res.json(result);
  } catch(e) {
    console.error(e);
    res.status(500).json({error: 'Server error'});
  }
};

exports.completeTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cid, tid } = req.params;
    const { approach_text } = req.body;

    const wordCount = (approach_text || "").trim().split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 30) {
      return res.status(400).json({ error: `Approach text must be at least 30 words.` });
    }

    const sq = await pool.query('SELECT squad_id FROM squad_members WHERE user_id = $1 AND is_active=true', [userId]);
    if(sq.rows.length === 0) return res.status(403).json({error: 'Not in squad'});
    const squadId = sq.rows[0].squad_id;

    await pool.query(`
      INSERT INTO member_challenge_progress (squad_id, challenge_id, user_id, task_id, status, approach_text, completed_at)
      VALUES ($1, $2, $3, $4, 'completed', $5, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, challenge_id, task_id) DO UPDATE SET status = 'completed', approach_text=$5
    `, [squadId, cid, userId, tid, approach_text]);
    
    // Log activity
    await pool.query(`INSERT INTO squad_activity_feed (squad_id, user_id, action, item, type) VALUES ($1, $2, 'completed', 'a challenge task', 'achievement')`, [squadId, userId]);

    // Check if the whole challenge is now completed by the squad!
    // Total tasks required for this challenge:
    const requiredQuery = await pool.query('SELECT COUNT(*) as total FROM challenge_tasks WHERE challenge_id = $1', [cid]);
    const requiredCount = parseInt(requiredQuery.rows[0].total);

    // Number of distinct tasks completed by ANY squad member:
    const completedQuery = await pool.query(`
      SELECT COUNT(DISTINCT task_id) as total_completed 
      FROM member_challenge_progress 
      WHERE squad_id = $1 AND challenge_id = $2 AND status = 'completed'
    `, [squadId, cid]);
    const completedCount = parseInt(completedQuery.rows[0].total_completed);

    if (completedCount >= requiredCount && requiredCount > 0) {
       // It's fully completed! Let's check if we haven't already marked it completed
       const activeCheck = await pool.query(`SELECT status FROM squad_challenges WHERE squad_id = $1 AND challenge_id = $2`, [squadId, cid]);
       if (activeCheck.rows.length > 0 && activeCheck.rows[0].status === 'active') {
          // Mark completed
          await pool.query(`UPDATE squad_challenges SET status = 'completed' WHERE squad_id = $1 AND challenge_id = $2`, [squadId, cid]);
          
          // Get challenge details for reward
          const chData = await pool.query(`SELECT title, squad_xp_bonus FROM challenges WHERE id = $1`, [cid]);
          if(chData.rows.length > 0) {
             const { title, squad_xp_bonus } = chData.rows[0];
             
             // Add bonus to squad total XP
             await pool.query(`UPDATE squads SET total_xp = total_xp + $1 WHERE id = $2`, [squad_xp_bonus, squadId]);
             
             // Send nudge to entire squad
             const msg = `🎉 Squad Goal Acheived! We completed the "${title}" challenge as a team! +${squad_xp_bonus} Squad XP!`;
             await pool.query(`INSERT INTO nudges (squad_id, target_user_id, type, message) VALUES ($1, NULL, 'challenge_completed', $3)`, [squadId, msg]);
             
             const io = req.app.get('io');
             if(io) io.to(`squad_${squadId}`).emit('new_nudge', { message: msg });
          }
       }
    }

    res.json({ message: 'Task marked as completed' });
  } catch(e) {
    console.error(e);
    res.status(500).json({error: 'Server error'});
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const sq = await pool.query('SELECT squad_id FROM squad_members WHERE user_id = $1 AND is_active=true', [userId]);
    if(sq.rows.length === 0) return res.status(403).json({error: 'Not in squad'});
    const squadId = sq.rows[0].squad_id;

    const messages = await pool.query(`
      SELECT m.*, u.name as user_name 
      FROM squad_chat_messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.squad_id = $1
      ORDER BY m.created_at ASC
    `, [squadId]);

    res.json(messages.rows);
  } catch(e) {
    console.error(e);
    res.status(500).json({error: 'Server error'});
  }
};
// --- RBAC HELPER & LEADER ENDPOINTS ---
async function verifyLeader(userId) {
  const check = await pool.query('SELECT squad_id FROM squad_members WHERE user_id = $1 AND role = $2 AND is_active = true', [userId, 'leader']);
  if (check.rows.length === 0) return null;
  return check.rows[0].squad_id;
}

exports.editGoal = async (req, res) => {
  try {
    const squadId = await verifyLeader(req.user.id);
    if (!squadId) return res.status(403).json({ error: 'Only the squad leader can edit the goal.' });
    const { goal_problems, goal_days } = req.body;
    
    const updates = [];
    const params = [];
    
    if (goal_problems !== undefined) {
      params.push(goal_problems);
      updates.push(`goal_problems = $${params.length}`);
    }
    if (goal_days !== undefined && goal_days >= 1) {
      params.push(goal_days);
      updates.push(`goal_period_end = goal_period_start + ($${params.length} || ' days')::INTERVAL`);
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update.' });
    
    params.push(squadId);
    await pool.query(`UPDATE squads SET ${updates.join(', ')} WHERE id = $${params.length}`, params);
    res.json({ message: 'Goal updated successfully' });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.kickMember = async (req, res) => {
  try {
    const squadId = await verifyLeader(req.user.id);
    if (!squadId) return res.status(403).json({ error: 'Only the squad leader can kick members.' });
    const { target_user_id } = req.body;
    if (target_user_id === req.user.id) return res.status(400).json({ error: 'You cannot kick yourself.' });

    await pool.query('UPDATE squad_members SET is_active = false WHERE squad_id = $1 AND user_id = $2', [squadId, target_user_id]);
    
    const io = req.app.get('io');
    if (io) io.to(`squad_${squadId}`).emit('member_kicked', { user_id: target_user_id });
    
    res.json({ message: 'Member kicked' });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.disbandSquad = async (req, res) => {
  try {
    const squadId = await verifyLeader(req.user.id);
    if (!squadId) return res.status(403).json({ error: 'Only the squad leader can disband the squad.' });

    await pool.query('UPDATE squads SET is_active = false WHERE id = $1', [squadId]);
    await pool.query('UPDATE squad_members SET is_active = false WHERE squad_id = $1', [squadId]);

    const io = req.app.get('io');
    if (io) io.to(`squad_${squadId}`).emit('squad_disbanded');

    res.json({ message: 'Squad disbanded' });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};
exports.debugBalanceSquad = async (req, res) => {
  try {
    const squadId = 3;
    await pool.query("UPDATE squad_challenges SET status = 'replaced' WHERE squad_id = $1 AND status = 'active'", [squadId]);
    const dp = await pool.query("SELECT id FROM challenges WHERE title ILIKE '%DP%Blitz%' ORDER BY id DESC LIMIT 1");
    const sql = await pool.query("SELECT id FROM challenges WHERE title ILIKE '%SQL%' ORDER BY id DESC LIMIT 1");
    if(dp.rows.length > 0) await pool.query("INSERT INTO squad_challenges (squad_id, challenge_id, expires_at, status) VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '7 days', 'active')", [squadId, dp.rows[0].id]);
    if(sql.rows.length > 0) await pool.query("INSERT INTO squad_challenges (squad_id, challenge_id, expires_at, status) VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '7 days', 'active')", [squadId, sql.rows[0].id]);
    res.json({ message: "Squad 3 balanced" });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
};
