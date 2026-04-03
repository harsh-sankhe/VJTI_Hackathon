const express = require('express');
const router = express.Router();
const controller = require('../controllers/squad.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/create', controller.createSquad);
router.post('/join', controller.joinSquad);
router.post('/leave', controller.leaveSquad);
router.get('/dashboard', controller.getDashboard);
router.get('/challenges', controller.getChallenges);
router.post('/challenge/:cid/task/:tid/complete', controller.completeTask);
router.get('/chat', controller.getChatHistory);

router.patch('/goal', controller.editGoal);
router.post('/kick', controller.kickMember);
router.post('/disband', controller.disbandSquad);

module.exports = router;
