const transactionModel = require('../../models/transactionModel');

const addTransaction = async (userId, data) => {
  const { type, amount, category, description, date } = data;

  return await transactionModel.createTransaction(
    userId,
    type,
    amount,
    category,
    description,
    date
  );
};

const getUserTransactions = async (userId) => {
  return await transactionModel.getTransactionsByUser(userId);
};

const removeTransaction = async (transactionId, userId) => {
  return await transactionModel.deleteTransaction(transactionId, userId);
};

module.exports = {
  addTransaction,
  getUserTransactions,
  removeTransaction
};