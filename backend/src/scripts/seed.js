const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') }); // getting from backend/.env

const problemsData = require('../data/problems.json');

const SUPABASE_URL = process.env.SUPABASE_URL;

if (!SUPABASE_URL || SUPABASE_URL.includes('[YOUR-PASSWORD]')) {
  console.error("❌ ERROR: Please replace [YOUR-PASSWORD] in the SUPABASE_URL in backend/.env with your actual password before running this script.");
  process.exit(1);
}

const client = new Client({
  connectionString: SUPABASE_URL,
});

async function createTables() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS code_grind_problems (
      problem_id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      topic VARCHAR(100) NOT NULL,
      subtopic VARCHAR(100) NOT NULL,
      difficulty VARCHAR(20) NOT NULL,
      leetcode_link TEXT NOT NULL,
      gfg_link TEXT,
      xp_value INT NOT NULL,
      striver_sheet_order INT NOT NULL
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS code_grind_user_progress (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      problem_id VARCHAR(50) REFERENCES code_grind_problems(problem_id),
      status VARCHAR(20) DEFAULT 'Unsolved', -- 'Unsolved', 'Partially Done', 'Completed'
      approach_text TEXT,
      completed_at TIMESTAMP,
      UNIQUE(user_id, problem_id)
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS code_grind_user_stats (
      user_id VARCHAR(50) PRIMARY KEY,
      total_xp INT DEFAULT 0,
      current_streak INT DEFAULT 0,
      last_solved_date DATE
    );
  `);
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS code_grind_badges (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      badge_code VARCHAR(50) NOT NULL,
      earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, badge_code)
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS code_grind_discussions (
      id SERIAL PRIMARY KEY,
      problem_id VARCHAR(50) REFERENCES code_grind_problems(problem_id),
      user_id VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      approach_snippet TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Tables created or verified.");
}

async function seedProblems() {
  await client.query(`DELETE FROM code_grind_user_progress`);
  await client.query(`DELETE FROM code_grind_discussions`);
  await client.query(`DELETE FROM code_grind_problems`); // For idempotency during development

  let count = 0;
  for (const p of problemsData) {
    await client.query(`
      INSERT INTO code_grind_problems 
      (problem_id, title, topic, subtopic, difficulty, leetcode_link, gfg_link, xp_value, striver_sheet_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (problem_id) DO NOTHING;
    `, [p.problem_id, p.title, p.topic, p.subtopic, p.difficulty, p.leetcode_link, p.gfg_link, p.xp_value, p.striver_sheet_order]);
    count++;
  }
  
  console.log(`✅ Seeded ${count} problems.`);
}

async function main() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");
    
    await createTables();
    await seedProblems();
    
    console.log("🎉 Database seeding complete!");
  } catch (err) {
    console.error("❌ Database seeding error:", err);
  } finally {
    await client.end();
  }
}

main();
