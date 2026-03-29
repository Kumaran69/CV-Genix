const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get comprehensive market analytics
router.post('/analytics', analyticsController.getMarketAnalytics);

// Get demand for specific skill
router.get('/skills/:skill/demand', analyticsController.getSkillDemand);

// Get salary trends
router.get('/salary-trends', analyticsController.getSalaryTrends);

module.exports = router;    