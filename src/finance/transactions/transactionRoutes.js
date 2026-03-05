const express = require('express');
const router = express.Router();

const verifyToken = require('../../middleware/jwtMiddleware');
const transactionController = require('./transactionController');

router.post('/', verifyToken, transactionController.addTransaction);

router.get('/', verifyToken, transactionController.getTransactions);

router.delete('/:id', verifyToken, transactionController.deleteTransaction);

module.exports = router;