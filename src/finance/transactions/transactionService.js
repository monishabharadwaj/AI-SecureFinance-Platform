const transactionModel = require('../../models/transactionModel');
const { analyzeTransaction } = require("../../ai/aiPredictor");

const addTransaction = async (userId, data) => {
  const { type, amount, category, description, date } = data;

  // Save transaction first
  const transaction = await transactionModel.createTransaction(
    userId,
    type,
    amount,
    category,
    description,
    date
  );

  try {
    // Get user's recent transaction sequence for ML analysis
    const userTransactions = await transactionModel.getTransactionsByUser(userId);
    const recentAmounts = userTransactions
      .slice(-10) // Last 10 transactions
      .map(t => t.amount);

    // Call ML service for anomaly detection
    const mlResult = await analyzeTransaction(amount, recentAmounts);

    // Log risk assessment
    if (mlResult.risk_level === "HIGH") {
      console.log(`⚠️ Suspicious transaction detected for user ${userId}: ₹${amount}`);
    }

    // You can store the risk score in the transaction record later
    // For now, just log it

  } catch (error) {
    console.error("ML analysis failed:", error.message);
    // Continue with transaction creation even if ML fails
  }

  return transaction;
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