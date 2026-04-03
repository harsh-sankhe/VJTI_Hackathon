const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // getting from backend/.env

const SUPABASE_URL = process.env.SUPABASE_URL;

if (!SUPABASE_URL || SUPABASE_URL.includes('[YOUR-PASSWORD]')) {
  console.error("❌ ERROR: Please replace [YOUR-PASSWORD] in the SUPABASE_URL in backend/.env with your actual password.");
  process.exit(1);
}

const client = new Client({
  connectionString: SUPABASE_URL,
});

async function createSquadTables() {
  // squads
  await client.query(`
    CREATE TABLE IF NOT EXISTS squads (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      invite_code VARCHAR(10) UNIQUE NOT NULL,
      leader_id INT REFERENCES users(id),
      goal_problems INT DEFAULT 0,
      goal_period_start TIMESTAMP,
      goal_period_end TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      total_xp INT DEFAULT 0
    );
  `);

  // squad_members
  await client.query(`
    CREATE TABLE IF NOT EXISTS squad_members (
      squad_id INT REFERENCES squads(id) ON DELETE CASCADE,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(20) DEFAULT 'member',
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      xp_this_week INT DEFAULT 0,
      PRIMARY KEY (squad_id, user_id)
    );
  `);

  // chat history
  await client.query(`
    CREATE TABLE IF NOT EXISTS squad_chat_messages (
      id SERIAL PRIMARY KEY,
      squad_id INT REFERENCES squads(id) ON DELETE CASCADE,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // challenges system
  await client.query(`
    CREATE TABLE IF NOT EXISTS challenges (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      xp_reward INT DEFAULT 0,
      badge_reward VARCHAR(100),
      squad_xp_bonus INT DEFAULT 0,
      duration_days INT DEFAULT 7,
      is_active BOOLEAN DEFAULT TRUE
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS challenge_tasks (
      id SERIAL PRIMARY KEY,
      challenge_id INT REFERENCES challenges(id) ON DELETE CASCADE,
      task_order INT DEFAULT 1,
      task_title VARCHAR(255) NOT NULL,
      external_link TEXT,
      platform VARCHAR(50)
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS squad_challenges (
      id SERIAL PRIMARY KEY,
      squad_id INT REFERENCES squads(id) ON DELETE CASCADE,
      challenge_id INT REFERENCES challenges(id) ON DELETE CASCADE,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP,
      status VARCHAR(20) DEFAULT 'active'
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS member_challenge_progress (
      id SERIAL PRIMARY KEY,
      squad_id INT REFERENCES squads(id) ON DELETE CASCADE,
      challenge_id INT REFERENCES challenges(id) ON DELETE CASCADE,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      task_id INT REFERENCES challenge_tasks(id) ON DELETE CASCADE,
      status VARCHAR(20) DEFAULT 'pending',
      approach_text TEXT,
      completed_at TIMESTAMP,
      UNIQUE(user_id, challenge_id, task_id)
    );
  `);

  // nudges
  await client.query(`
    CREATE TABLE IF NOT EXISTS nudges (
      id SERIAL PRIMARY KEY,
      squad_id INT REFERENCES squads(id) ON DELETE CASCADE,
      target_user_id INT, -- NULL means all members
      type VARCHAR(50),
      message TEXT NOT NULL,
      triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_read BOOLEAN DEFAULT FALSE
    );
  `);

  // activity feed
  await client.query(`
    CREATE TABLE IF NOT EXISTS squad_activity_feed (
      id SERIAL PRIMARY KEY,
      squad_id INT REFERENCES squads(id) ON DELETE CASCADE,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      action VARCHAR(50),
      item VARCHAR(255),
      type VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed sample challenge
  const res = await client.query(`SELECT id FROM challenges LIMIT 1`);
  if (res.rows.length === 0) {
    const chRes = await client.query(`
      INSERT INTO challenges (type, title, description, xp_reward, badge_reward, squad_xp_bonus, duration_days, is_active)
      VALUES 
      ('coding', 'DP Hard Blitz', 'Solve 4 Hard Dynamic Programming problems', 100, 'DP Destroyer', 200, 7, true),
      ('quiz', 'SQL Joins Mastery', 'Watch tutorial and clear 10 SQL quizzes.', 75, 'SQL Expert', 150, 7, true)
      RETURNING id
    `);
    
    // DP Hard Blitz tasks
    const dpId = chRes.rows[0].id;
    await client.query(`
      INSERT INTO challenge_tasks (challenge_id, task_order, task_title, external_link, platform) VALUES
      ($1, 1, 'Longest Common Subsequence', 'https://leetcode.com/problems/longest-common-subsequence/', 'leetcode'),
      ($1, 2, 'Edit Distance', 'https://leetcode.com/problems/edit-distance/', 'leetcode'),
      ($1, 3, 'Partition Equal Subset Sum', 'https://leetcode.com/problems/partition-equal-subset-sum/', 'leetcode'),
      ($1, 4, 'Burst Balloons', 'https://leetcode.com/problems/burst-balloons/', 'leetcode')
    `, [dpId]);

    // SQL Joins tasks
    const sqlId = chRes.rows[1].id;
    await client.query(`
      INSERT INTO challenge_tasks (challenge_id, task_order, task_title, external_link, platform) VALUES
      ($1, 1, 'SQL Joins Tutorial', 'https://www.youtube.com/watch?v=9yeOJ0ZMUYw', 'youtube'),
      ($1, 2, 'Advanced Joins Quiz', '/app/quiz?tag=sql_joins', 'internal')
    `, [sqlId]);
  }

  console.log("✅ Squad tables created and seeded.");
}

async function main() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");
    await createSquadTables();
  } catch (err) {
    console.error("❌ Database schema error:", err);
  } finally {
    await client.end();
  }
}

main();
