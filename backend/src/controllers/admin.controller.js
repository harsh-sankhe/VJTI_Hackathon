const pool = require('../config/db');

exports.createGlobalChallenge = async (req, res) => {
  try {
    // Only admins allowed -> handled by middleware in route
    const { title, type, description, xp_reward, squad_xp_bonus, duration_days, tasks } = req.body;

    if (!title || !type || !tasks || tasks.length === 0) {
      return res.status(400).json({ error: 'Missing required challenge fields or tasks.' });
    }

    const badge_reward = req.body.badge_reward || 'Global Challenger';

    // Insert new challenge
    const chRes = await pool.query(`
      INSERT INTO challenges (title, type, description, xp_reward, squad_xp_bonus, duration_days, badge_reward, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING id, title
    `, [title, type, description || '', xp_reward || 0, squad_xp_bonus || 0, duration_days || 7, badge_reward]);

    const challengeId = chRes.rows[0].id;

    // Insert all tasks
    const taskValues = [];
    let queryStr = `INSERT INTO challenge_tasks (challenge_id, task_order, task_title, external_link, platform) VALUES `;
    
    tasks.forEach((t, index) => {
      taskValues.push(challengeId, index + 1, t.task_title, t.external_link || '', t.platform || 'custom');
      const offset = index * 5;
      queryStr += `($${offset+1}, $${offset+2}, $${offset+3}, $${offset+4}, $${offset+5})`;
      if (index < tasks.length - 1) queryStr += ', ';
    });

    await pool.query(queryStr, taskValues);

    res.status(201).json({ message: 'Global Challenge successfully created!', challenge: chRes.rows[0] });

  } catch (err) {
    console.error('Create Global Challenge error:', err);
    res.status(500).json({ error: 'Server error creating challenge.' });
  }
};

exports.getAllChallenges = async (req, res) => {
  try {
    const ch = await pool.query('SELECT * FROM challenges ORDER BY id DESC');
    res.json(ch.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
