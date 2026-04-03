const pool = require('../config/db');

const getUserId = (req) => req.user?.id || 'user_123';

// 1. Get all topics with progress for the current user
exports.getTopics = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.topic,
        COUNT(p.problem_id) as total_problems,
        COUNT(up.problem_id) FILTER (WHERE up.status = 'Completed') as solved_problems
      FROM code_grind_problems p
      LEFT JOIN code_grind_user_progress up 
        ON p.problem_id = up.problem_id AND up.user_id = $1
      GROUP BY p.topic
      ORDER BY p.topic;
    `, [getUserId(req)]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 2. Get problems (optionally filtered by topics)
exports.getProblems = async (req, res) => {
  try {
    const { topics } = req.query; // 'Arrays,Graphs'
    
    let query = `
      SELECT 
        p.problem_id, p.title, p.topic, p.subtopic, p.difficulty, p.leetcode_link, p.gfg_link, p.xp_value, p.striver_sheet_order,
        COALESCE(up.status, 'Unsolved') as status
      FROM code_grind_problems p
      LEFT JOIN code_grind_user_progress up 
        ON p.problem_id = up.problem_id AND up.user_id = $1
    `;
    const params = [getUserId(req)];

    if (topics) {
      const topicArray = topics.split(',');
      query += ` WHERE p.topic = ANY($2)`;
      params.push(topicArray);
    }

    query += ` ORDER BY p.striver_sheet_order ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 3. Mark problem as partial (Ask for Hint)
exports.askForHint = async (req, res) => {
  const problemId = req.params.id;
  try {
    await pool.query(`
      INSERT INTO code_grind_user_progress (user_id, problem_id, status)
      VALUES ($1, $2, 'Partially Done')
      ON CONFLICT (user_id, problem_id) 
      DO UPDATE SET status = 'Partially Done' WHERE code_grind_user_progress.status = 'Unsolved';
    `, [getUserId(req), problemId]);
    res.json({ success: true, message: "Marked as Partially Done. You can now ask for hints." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 4. Mark problem as completed
exports.completeProblem = async (req, res) => {
  const problemId = req.params.id;
  const { approach_text } = req.body;
  
  if (!approach_text || approach_text.trim().split(/\s+/).filter(w => w.length > 0).length < 30) {
    return res.status(400).json({ error: 'Approach text must be at least 30 words.' });
  }

  try {
    // Get problem xp
    const probRes = await pool.query(`SELECT xp_value, difficulty FROM code_grind_problems WHERE problem_id = $1`, [problemId]);
    if (probRes.rows.length === 0) return res.status(404).json({ error: 'Problem not found' });
    const { xp_value } = probRes.rows[0];

    // Check if already completed to avoid double counting XP
    const userId = getUserId(req);
    const statusRes = await pool.query(`SELECT status FROM code_grind_user_progress WHERE user_id = $1 AND problem_id = $2`, [userId, problemId]);
    const alreadyCompleted = statusRes.rows.length > 0 && statusRes.rows[0].status === 'Completed';

    if (!alreadyCompleted) {
      // Upsert progress
      await pool.query(`
        INSERT INTO code_grind_user_progress (user_id, problem_id, status, approach_text, completed_at)
        VALUES ($1, $2, 'Completed', $3, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, problem_id) 
        DO UPDATE SET status = 'Completed', approach_text = $3, completed_at = CURRENT_TIMESTAMP;
      `, [userId, problemId, approach_text]);

      // Update XP and streak
      await pool.query(`
        INSERT INTO code_grind_user_stats (user_id, total_xp, current_streak, last_solved_date)
        VALUES ($1, $2, 1, CURRENT_DATE)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          total_xp = code_grind_user_stats.total_xp + $2,
          current_streak = CASE 
            WHEN code_grind_user_stats.last_solved_date = CURRENT_DATE - integer '1' THEN code_grind_user_stats.current_streak + 1
            WHEN code_grind_user_stats.last_solved_date = CURRENT_DATE THEN code_grind_user_stats.current_streak
            ELSE 1
          END,
          last_solved_date = CURRENT_DATE;
      `, [userId, xp_value]);

      // Simple Badge Logic Check (e.g. First Blood)
      const totalSolvedRes = await pool.query(`SELECT COUNT(*) as count FROM code_grind_user_progress WHERE user_id = $1 AND status = 'Completed'`, [userId]);
      const solvedCount = parseInt(totalSolvedRes.rows[0].count);
      
      let newBadges = [];
      if (solvedCount === 1) {
        // Award First Blood
        await pool.query(`INSERT INTO code_grind_badges (user_id, badge_code) VALUES ($1, 'FIRST_BLOOD') ON CONFLICT DO NOTHING`, [userId]);
        newBadges.push({ code: 'FIRST_BLOOD', name: 'First Blood', icon: '🥇' });
      }

      res.json({ success: true, xp_earned: xp_value, new_badges: newBadges });
    } else {
      res.json({ success: true, xp_earned: 0, message: "Already completed" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 5. Get user profile stats
exports.getStats = async (req, res) => {
  try {
    const userId = getUserId(req);
    const statsRes = await pool.query(`SELECT total_xp, current_streak FROM code_grind_user_stats WHERE user_id = $1`, [userId]);
    const totalSolvedRes = await pool.query(`
      SELECT p.difficulty, COUNT(*) as count 
      FROM code_grind_user_progress up
      JOIN code_grind_problems p ON up.problem_id = p.problem_id
      WHERE up.user_id = $1 AND up.status = 'Completed'
      GROUP BY p.difficulty
    `, [userId]);

    const badgesRes = await pool.query(`SELECT badge_code FROM code_grind_badges WHERE user_id = $1`, [userId]);

    const breakdown = { Easy: 0, Medium: 0, Hard: 0 };
    totalSolvedRes.rows.forEach(r => breakdown[r.difficulty] = parseInt(r.count));
    
    res.json({
      xp: statsRes.rows.length > 0 ? statsRes.rows[0].total_xp : 0,
      streak: statsRes.rows.length > 0 ? statsRes.rows[0].current_streak : 0,
      breakdown,
      total_solved: breakdown.Easy + breakdown.Medium + breakdown.Hard,
      badges: badgesRes.rows.map(b => b.badge_code)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 6. Get discussions for a problem
exports.getDiscussions = async (req, res) => {
  const problemId = req.params.id;
  try {
    const result = await pool.query(`
      SELECT d.id, d.user_id, d.message, d.created_at, up.approach_text
      FROM code_grind_discussions d
      LEFT JOIN code_grind_user_progress up ON d.user_id = up.user_id AND d.problem_id = up.problem_id
      WHERE d.problem_id = $1
      ORDER BY d.created_at ASC
    `, [problemId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 7. Post a discussion message
exports.postDiscussion = async (req, res) => {
  const problemId = req.params.id;
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    const userId = getUserId(req);
    const result = await pool.query(`
      INSERT INTO code_grind_discussions (problem_id, user_id, message)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, message, created_at
    `, [problemId, userId, message]);

    const progRes = await pool.query('SELECT approach_text FROM code_grind_user_progress WHERE user_id=$1 AND problem_id=$2', [userId, problemId]);
    const obj = result.rows[0];
    obj.approach_text = progRes.rows.length > 0 ? progRes.rows[0].approach_text : '';
    res.json(obj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
