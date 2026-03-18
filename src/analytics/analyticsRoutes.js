const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/jwtMiddleware');

const analyticsController = require('./analyticsController');
const aiDashboardController = require('./aiDashboardController');

router.get('/summary', verifyToken, analyticsController.getSummary);
router.get('/categories', verifyToken, analyticsController.getCategories);
router.get('/monthly', verifyToken, analyticsController.getMonthly);

router.get('/ai-dashboard', verifyToken, aiDashboardController.getDashboard);

module.exports = router;
