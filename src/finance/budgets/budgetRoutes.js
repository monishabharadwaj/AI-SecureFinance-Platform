const express = require('express');
const router = express.Router();
const budgetController = require('./budgetController');
const verifyToken = require('../../middleware/jwtMiddleware');

router.use(verifyToken);

router.post('/', budgetController.createBudget);
router.get('/', budgetController.getBudgets);
router.put('/:id', budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;