require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const pool = require('../config/db');

async function setupSchema() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Creating new Quiz Engine tables...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER NOT NULL,
        subtopic TEXT NOT NULL,
        question_text TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_option CHAR(1) NOT NULL,
        difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
        concept_tested TEXT NOT NULL,
        explanation TEXT NOT NULL,
        prerequisite_concept TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        topic_id INTEGER NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        total_questions INTEGER DEFAULT 10,
        questions_answered INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'in_progress',
        final_score FLOAT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_responses (
        id SERIAL PRIMARY KEY,
        session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        question_order INTEGER NOT NULL,
        selected_option CHAR(1),
        is_correct BOOLEAN NOT NULL,
        confidence VARCHAR(20) NOT NULL,
        difficulty_at_time INTEGER NOT NULL,
        points_awarded FLOAT,
        answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS subtopic_performance (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        topic_id INTEGER NOT NULL,
        subtopic TEXT NOT NULL,
        total_attempted INTEGER DEFAULT 0,
        total_correct INTEGER DEFAULT 0,
        confidence_weighted_score FLOAT DEFAULT 0.0,
        weakness_flag VARCHAR(20) DEFAULT 'untested',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, topic_id, subtopic)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS concept_gaps (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        topic_id INTEGER NOT NULL,
        concept TEXT NOT NULL,
        times_failed_confident INTEGER DEFAULT 0,
        times_failed_unsure INTEGER DEFAULT 0,
        priority_score FLOAT DEFAULT 0.0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, topic_id, concept)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS spaced_repetition_queue (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        topic_id INTEGER NOT NULL,
        subtopic TEXT NOT NULL,
        next_review_date DATE NOT NULL,
        interval_days INTEGER DEFAULT 1,
        ease_factor FLOAT DEFAULT 2.5,
        repetition_count INTEGER DEFAULT 0,
        reason VARCHAR(50),
        UNIQUE (user_id, topic_id, subtopic)
      );
    `);

    await client.query('COMMIT');
    console.log('Quiz tables created successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

setupSchema();
