const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/jwtMiddleware');
const analyticsController = require('./analyticsController');

router.get('/summary', verifyToken, analyticsController.getSummary);
router.get('/categories', verifyToken, analyticsController.getCategories);
router.get('/monthly', verifyToken, analyticsController.getMonthly);

module.exports = router;