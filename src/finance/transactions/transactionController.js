const transactionService = require('./transactionService');

const addTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const transactionId = await transactionService.addTransaction(
      userId,
      req.body
    );

    res.status(201).json({
      message: "Transaction created",
      transactionId
    });
  } catch (err) {
    next(err);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const transactions = await transactionService.getUserTransactions(userId);

    res.json(transactions);
  } catch (err) {
    next(err);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await transactionService.removeTransaction(id, userId);

    res.json({ message: "Transaction deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  deleteTransaction
};