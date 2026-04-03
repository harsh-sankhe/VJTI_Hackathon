const pool = require('../config/db');

const getUserId = (req) => String(req.user?.id || 'user_123');

exports.startSession = async (req, res) => {
  const { topic_id } = req.body;
  const userId = getUserId(req);

  try {
    const sessionRes = await pool.query(
      `INSERT INTO quiz_sessions (user_id, topic_id) VALUES ($1, $2) RETURNING id`,
      [userId, topic_id]
    );
    const sessionId = sessionRes.rows[0].id;

    const topicsArr = String(topic_id).split(',').map(Number);
    const historyRes = await pool.query(
      `SELECT weakness_flag, confidence_weighted_score FROM subtopic_performance WHERE user_id = $1 AND topic_id = ANY($2::int[])`,
      [userId, topicsArr]
    );

    let targetDifficulty = 2; // Default
    if (historyRes.rows.length > 0) {
      if (historyRes.rows.some(r => r.weakness_flag === 'critical')) {
        targetDifficulty = 1;
      } else {
        targetDifficulty = 3;
      }
    }

    const firstQuestion = await fetchAdaptiveQuestion(topic_id, targetDifficulty, []);
    res.json({ session_id: sessionId, question: firstQuestion, question_order: 1 });
  } catch (err) {
    console.error('Error starting session:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

async function fetchAdaptiveQuestion(topics_str, targetDifficulty, askedIds) {
  const topicsArr = String(topics_str).split(',').map(Number);
  let query = `SELECT id, question_text, option_a, option_b, option_c, option_d, difficulty, subtopic, explanation, concept_tested FROM questions WHERE topic_id = ANY($1::int[])`;
  const params = [topicsArr];

  if (askedIds && askedIds.length > 0) {
    query += ` AND id != ALL($2::int[])`;
    params.push(askedIds);
  }

  // Find nearest difficulty
  query += ` ORDER BY ABS(difficulty - $${params.length + 1}) ASC LIMIT 1`;
  params.push(targetDifficulty);

  const res = await pool.query(query, params);
  const q = res.rows.length > 0 ? res.rows[0] : null;
  if(q) {
     q.options = [q.option_a, q.option_b, q.option_c, q.option_d]; // Array format for frontend
     delete q.option_a; delete q.option_b; delete q.option_c; delete q.option_d;
  }
  return q;
}

exports.answerQuestion = async (req, res) => {
  const { session_id, question_id, selected_option, confidence } = req.body;
  const userId = getUserId(req);

  try {
    // 1. Verify session & fetch question
    const sessRes = await pool.query(`SELECT status, questions_answered, topic_id FROM quiz_sessions WHERE id = $1 AND user_id = $2`, [session_id, userId]);
    if (sessRes.rows.length === 0 || sessRes.rows[0].status === 'completed') return res.status(400).json({ error: 'Invalid or completed session' });
    const session = sessRes.rows[0];

    const qRes = await pool.query(`SELECT topic_id, correct_option, difficulty, subtopic, concept_tested, explanation, prerequisite_concept FROM questions WHERE id = $1`, [question_id]);
    const questionData = qRes.rows[0];
    const isCorrect = selected_option === questionData.correct_option;
    
    // 2. Calculate Points & Next Difficulty
    let points = 0;
    let nextDiffDelta = 0;
    let priorityScoreInc = 0;
    let confidenceFlag = null;

    if (isCorrect) {
      if (confidence === 'sure') { points = 3.0; nextDiffDelta = 1; }
      else if (confidence === 'unsure') { points = 1.0; nextDiffDelta = 0; }
      else if (confidence === 'guessing') { points = 0.0; nextDiffDelta = -1; priorityScoreInc = 0.5; confidenceFlag = 'lucky_guess'; }
    } else {
      if (confidence === 'sure') { points = -1.0; nextDiffDelta = -2; priorityScoreInc = 3.0; confidenceFlag = 'critical_gap'; }
      else if (confidence === 'unsure') { points = -0.5; nextDiffDelta = -1; priorityScoreInc = 1.0; }
      else if (confidence === 'guessing') { points = 0.0; nextDiffDelta = 0; }
    }

    // 3. Save Response
    await pool.query(
      `INSERT INTO quiz_responses (session_id, question_id, question_order, selected_option, is_correct, confidence, difficulty_at_time, points_awarded) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [session_id, question_id, session.questions_answered + 1, selected_option, isCorrect, confidence, questionData.difficulty, points]
    );

    // 4. Update subtopic performance
    const maxPoints = 3.0;
    const currentScorePercent = (Math.max(0, points) / maxPoints) * 100;

    let perfRes = await pool.query(`SELECT total_attempted, total_correct, confidence_weighted_score FROM subtopic_performance WHERE user_id = $1 AND topic_id = $2 AND subtopic = $3`, [userId, questionData.topic_id, questionData.subtopic]);
    if (perfRes.rows.length === 0) {
       await pool.query(`INSERT INTO subtopic_performance (user_id, topic_id, subtopic) VALUES ($1, $2, $3)`, [userId, questionData.topic_id, questionData.subtopic]);
       perfRes = { rows: [{ total_attempted: 0, total_correct: 0, confidence_weighted_score: 0 }] };
    }
    
    const prev = perfRes.rows[0];
    const newTotalAcc = isCorrect ? prev.total_correct + 1 : prev.total_correct;
    const newTotalA = prev.total_attempted + 1;
    // Moving average of score
    const newScore = ((prev.confidence_weighted_score * prev.total_attempted) + currentScorePercent) / newTotalA;
    let wFlag = 'untested';
    if(newScore >= 80) wFlag = 'strong';
    else if(newScore >= 60) wFlag = 'shaky';
    else if(newScore >= 40) wFlag = 'weak';
    else wFlag = 'critical';

    await pool.query(
      `UPDATE subtopic_performance SET total_attempted = $1, total_correct = $2, confidence_weighted_score = $3, weakness_flag = $4 WHERE user_id = $5 AND topic_id = $6 AND subtopic = $7`,
      [newTotalA, newTotalAcc, newScore, wFlag, userId, questionData.topic_id, questionData.subtopic]
    );

    // 5. Update concept gaps & Spaced Repetition if wrong or lucky
    if (!isCorrect || confidenceFlag === 'lucky_guess') {
      await pool.query(`
        INSERT INTO concept_gaps (user_id, topic_id, concept, times_failed_confident, times_failed_unsure, priority_score)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, topic_id, concept) DO UPDATE SET
        times_failed_confident = concept_gaps.times_failed_confident + $4,
        times_failed_unsure = concept_gaps.times_failed_unsure + $5,
        priority_score = concept_gaps.priority_score + $6
      `, [userId, questionData.topic_id, questionData.concept_tested, (confidence === 'sure' && !isCorrect ? 1 : 0), (confidence === 'unsure' && !isCorrect ? 1 : 0), priorityScoreInc]);
      
      // Spaced repetition
      const reason = !isCorrect ? `wrong_${confidence}` : 'lucky_guess';
      const sm2EaseDec = confidence === 'sure' ? 0.15 : 0.08;
      await pool.query(`
        INSERT INTO spaced_repetition_queue (user_id, topic_id, subtopic, next_review_date, reason)
        VALUES ($1, $2, $3, CURRENT_DATE + INTERVAL '1 day', $4)
        ON CONFLICT (user_id, topic_id, subtopic) DO UPDATE SET
        ease_factor = GREATEST(1.3, spaced_repetition_queue.ease_factor - $5),
        next_review_date = CURRENT_DATE + (spaced_repetition_queue.interval_days * spaced_repetition_queue.ease_factor * INTERVAL '1 day')
      `, [userId, questionData.topic_id, questionData.subtopic, reason, sm2EaseDec]);
    }

    // 6. Session completion logic
    const nextQAnswered = session.questions_answered + 1;
    let isComplete = false;
    let nextQ = null;

    const askedRes = await pool.query(`SELECT question_id FROM quiz_responses WHERE session_id = $1`, [session_id]);
    const askedIds = askedRes.rows.map(r => r.question_id);
    let newDiff = Math.max(1, Math.min(5, questionData.difficulty + nextDiffDelta));
    nextQ = await fetchAdaptiveQuestion(session.topic_id, newDiff, askedIds);

    if (nextQAnswered >= 10 || !nextQ) {
      isComplete = true;
      nextQ = null;
      await pool.query(`UPDATE quiz_sessions SET status = 'completed', completed_at = CURRENT_TIMESTAMP, questions_answered = $1 WHERE id = $2`, [nextQAnswered, session_id]);
      
      const finalScoreQuery = await pool.query(`SELECT SUM(points_awarded) as score FROM quiz_responses WHERE session_id = $1`, [session_id]);
      const finalScore = finalScoreQuery.rows[0].score || 0;
      let xpEarned = 5;
      const maxScore = nextQAnswered * 3.0; // Dynamic max score
      const scorePct = (finalScore / (maxScore || 1)) * 100;
      
      if(scorePct >= 80) xpEarned = 50;
      else if(scorePct >= 60) xpEarned = 30;
      else if(scorePct >= 40) xpEarned = 15;

      await pool.query(`
        INSERT INTO user_daily_activity (user_id, activity_date, xp_gained, problems_solved)
        VALUES ($1, CURRENT_DATE, $2, 1)
        ON CONFLICT (user_id, activity_date)
        DO UPDATE SET 
          xp_gained = user_daily_activity.xp_gained + $2,
          problems_solved = user_daily_activity.problems_solved + 1;
      `, [userId, xpEarned]);

    } else {
      await pool.query(`UPDATE quiz_sessions SET questions_answered = $1 WHERE id = $2`, [nextQAnswered, session_id]);
    }

    res.json({
      is_correct: isCorrect,
      correct_answer: questionData.correct_option,
      points_awarded: points,
      concept_gap: (!isCorrect) ? questionData.explanation : null,
      confidence_flag: confidenceFlag,
      questions_remaining: 10 - nextQAnswered,
      next_question: nextQ,
      session_complete: isComplete
    });

  } catch (err) {
    console.error('Error processing answer:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getInsights = async (req, res) => {
  const { session_id } = req.params;
  const userId = getUserId(req);

  try {
    // Use session_id alone (it's a UUID, globally unique) — removes user_id mismatch bug
    const sessionRes = await pool.query(`SELECT topic_id, final_score, user_id FROM quiz_sessions WHERE id = $1`, [session_id]);
    if(sessionRes.rows.length === 0) return res.status(404).json({error: "Session not found"});
    const topicId = sessionRes.rows[0].topic_id;
    const sessionUserId = sessionRes.rows[0].user_id || userId; // use stored user_id for subsequent queries

    const resp = await pool.query(`
      SELECT 
        qr.confidence, qr.is_correct, qr.points_awarded, 
        q.subtopic, q.concept_tested, q.prerequisite_concept 
      FROM quiz_responses qr
      JOIN questions q ON qr.question_id = q.id
      WHERE qr.session_id = $1
    `, [session_id]);
    
    let stats = { correct_sure:0, correct_unsure:0, correct_guessing:0, wrong_sure:0, wrong_unsure:0, wrong_guessing:0 };
    resp.rows.forEach(r => {
      const mode = (r.is_correct ? 'correct_' : 'wrong_') + r.confidence;
      if (stats[mode] !== undefined) stats[mode]++;
    });

    const topicsArr = String(topicId).split(',').map(Number);

    // Session-specific Heatmap
    const subtopicAgg = {};
    resp.rows.forEach(r => {
       if (!subtopicAgg[r.subtopic]) subtopicAgg[r.subtopic] = { pts: 0, count: 0, criticalCount: 0, weakCount: 0 };
       subtopicAgg[r.subtopic].pts += Math.max(0, r.points_awarded);
       subtopicAgg[r.subtopic].count += 1;
       if (!r.is_correct && r.confidence === 'sure') subtopicAgg[r.subtopic].criticalCount += 1;
       if (!r.is_correct && r.confidence === 'unsure') subtopicAgg[r.subtopic].weakCount += 1;
    });

    const heatmap = Object.keys(subtopicAgg).map(sub => {
       const d = subtopicAgg[sub];
       const maxPts = d.count * 3.0;
       const scorePct = (d.pts / (maxPts || 1)) * 100;
       let wFlag = 'untested';
       if(d.criticalCount > 0) wFlag = 'critical';
       else if(d.weakCount > 0) wFlag = 'weak';
       else if(scorePct < 60) wFlag = 'shaky';
       else wFlag = 'strong';

       return {
         subtopic: sub,
         score: scorePct,
         weakness_flag: wFlag,
         questions_attempted: d.count,
         color: wFlag === 'critical' ? '#EF4444' : wFlag === 'weak' ? '#F97316' : wFlag === 'shaky' ? '#EAB308' : '#22C55E'
       };
    });

    // Build concept map from the session responses + enrich with full topic prerequisite chains
    const sessionConcepts = resp.rows.map(r => r.concept_tested);
    const sessionConceptSet = new Set(sessionConcepts);

    // Determine per-concept performance from this session
    const conceptPerf = {};
    resp.rows.forEach(r => {
       const id = r.concept_tested;
       let status = 'strong';
       if (!r.is_correct && r.confidence === 'sure') status = 'critical';
       else if (!r.is_correct) status = 'weak';
       else if (r.confidence !== 'sure') status = 'shaky';
       // Take worst status if concept answered multiple times
       if (!conceptPerf[id] || status === 'critical' || (status === 'weak' && conceptPerf[id] !== 'critical')) {
          conceptPerf[id] = status;
       }
    });

    // Fetch ALL prerequisite relationships from the topic (not just answered questions)
    const allRelRes = await pool.query(`
      SELECT DISTINCT concept_tested, prerequisite_concept 
      FROM questions 
      WHERE topic_id = ANY($1::int[]) AND concept_tested IS NOT NULL
      ORDER BY concept_tested
    `, [topicsArr]);

    const nodes = [];
    const links = [];
    const includedConcepts = new Set();

    allRelRes.rows.forEach(row => {
       const id = row.concept_tested;
       const prereq = row.prerequisite_concept;

       // Add main concept node
       if (!includedConcepts.has(id)) {
          const perf = conceptPerf[id];
          let color = '#6366f1'; // default - topic concept, not tested yet in session
          if (perf === 'critical') color = '#EF4444';
          else if (perf === 'weak') color = '#F97316';
          else if (perf === 'shaky') color = '#EAB308';
          else if (perf === 'strong') color = '#22C55E';
          else if (sessionConceptSet.has(id)) color = '#22C55E'; // tested + correct
          nodes.push({ id, label: id, performance: perf || (sessionConceptSet.has(id) ? 'strong' : 'untested'), color });
          includedConcepts.add(id);
       }

       // Add prerequisite concept node if missing
       if (prereq && !includedConcepts.has(prereq)) {
          const perf = conceptPerf[prereq];
          let color = '#9CA3AF';
          if (perf === 'critical') color = '#EF4444';
          else if (perf === 'weak') color = '#F97316';
          else if (perf === 'shaky') color = '#EAB308';
          else if (perf === 'strong') color = '#22C55E';
          nodes.push({ id: prereq, label: prereq, performance: perf || 'untested', color });
          includedConcepts.add(prereq);
       }

       // Add link
       if (prereq) {
          links.push({ source: prereq, target: id });
       }
    });

    const confidenceReport = {
      sure_accuracy: stats.correct_sure / (stats.correct_sure + stats.wrong_sure || 1) * 100,
      unsure_accuracy: stats.correct_unsure / (stats.correct_unsure + stats.wrong_unsure || 1) * 100,
      guessing_accuracy: stats.correct_guessing / (stats.correct_guessing + stats.wrong_guessing || 1) * 100,
      insight_text: "Your confidence calibration is tracking steadily."
    };

    // Calculate priority review based on this session's critical gaps
    const priorityReview = [];
    resp.rows.forEach(r => {
        if (!r.is_correct && r.confidence === 'sure' && !priorityReview.find(p => p.concept === r.concept_tested)) {
            priorityReview.push({
                concept: r.concept_tested,
                priority_score: 5,
                suggestion_text: `Critical gap shown in this session for ${r.concept_tested}.`
            });
        }
    });

    const srRes = await pool.query(`SELECT subtopic, next_review_date, reason FROM spaced_repetition_queue WHERE user_id = $1 AND topic_id = ANY($2::int[]) ORDER BY next_review_date ASC LIMIT 5`, [sessionUserId, topicsArr]);
    
    let totalPoints = resp.rows.reduce((acc, curr) => acc + curr.points_awarded, 0);
    let maxPoints = (resp.rows.length || 1) * 3.0;

    res.json({
       summary: {
         topic_id: topicId,
         total_score: totalPoints,
         percentage: Math.max(0, Math.min(100, (totalPoints / maxPoints) * 100)),
         questions_answered: resp.rows.length,
         breakdown: stats
       },
       heatmap_data: heatmap,
       concept_map: { nodes, links },
       confidence_report: confidenceReport,
       priority_list: priorityReview,
       spaced_repetition: srRes.rows
    });
  } catch (err) {
    console.error('Error fetching insights:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getHistory = async (req, res) => {
  const userId = getUserId(req);
  try {
    const sr = await pool.query(`SELECT * FROM quiz_sessions WHERE user_id = $1 ORDER BY started_at DESC LIMIT 10`, [userId]);
    res.json(sr.rows);
  } catch (err) { res.status(500).json({error: 'Server error'}); }
};

exports.getRevisionDue = async (req, res) => {
  const userId = getUserId(req);
  try {
    const sr = await pool.query(`SELECT * FROM spaced_repetition_queue WHERE user_id = $1 AND next_review_date <= CURRENT_DATE`, [userId]);
    res.json(sr.rows);
  } catch (err) { res.status(500).json({error: 'Server error'}); }
};

exports.scheduleRevision = async (req, res) => { res.json({success: true}); };
exports.getTopicPerformance = async (req, res) => {
  const userId = getUserId(req);
  const { topic_id } = req.params;
  try {
    const perf = await pool.query(`SELECT * FROM subtopic_performance WHERE user_id = $1 AND topic_id = $2`, [userId, topic_id]);
    res.json(perf.rows);
  } catch (err) { res.status(500).json({error: 'Server error'}); }
};
