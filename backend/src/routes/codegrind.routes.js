const express = require('express');
const router = express.Router();
const controller = require('../controllers/codegrind.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Protect all Code Grind routes with JWT middleware
router.use(authMiddleware);

router.get('/topics', controller.getTopics);
router.get('/problems', controller.getProblems);
router.post('/problems/:id/hint', controller.askForHint);
router.post('/problems/:id/complete', controller.completeProblem);
router.get('/stats', controller.getStats);
router.get('/problems/:id/discussions', controller.getDiscussions);
router.post('/problems/:id/discussions', controller.postDiscussion);

module.exports = router;
