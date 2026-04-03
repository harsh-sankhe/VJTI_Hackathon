const express = require('express');
const router = express.Router();
const controller = require('../controllers/quiz.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/start', controller.startSession);
router.post('/answer', controller.answerQuestion);
router.get('/results/:session_id', controller.getInsights);
router.get('/history', controller.getHistory); // using user_id from token
router.get('/revision-due', controller.getRevisionDue);
router.post('/revision-schedule', controller.scheduleRevision);
router.get('/topic-performance/:topic_id', controller.getTopicPerformance);

module.exports = router;
