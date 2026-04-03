const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const verifyToken = require('../middleware/auth.middleware');

// Middleware to check if user is admin
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
};

router.post('/challenges', verifyToken, verifyAdmin, adminController.createGlobalChallenge);
router.get('/challenges', verifyToken, verifyAdmin, adminController.getAllChallenges);

module.exports = router;
