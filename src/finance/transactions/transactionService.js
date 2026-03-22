const transactionModel = require('../../models/transactionModel');
const { analyzeTransaction } = require("../../ai/aiPredictor");

const addTransaction = async (userId, data) => {
  const { type, amount, category, description } = data;
  const date = data.date || new Date();

  let mlResult = null;

  try {
    if (type === 'expense' || type === 'debit') {
      // Fetch user transactions
      const userTransactions = await transactionModel.getTransactionsByUser(userId);

      // Sort transactions chronologically
      const sortedTransactions = userTransactions.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Build sequence for ML (last 10 transactions)
      const recentAmounts = sortedTransactions
        .slice(-10)
        .map(t => t.amount);

      // Run ML analysis
      mlResult = await analyzeTransaction(amount, recentAmounts);

      // Log risk assessment
      if (mlResult.risk_level === "HIGH") {
        console.log(
          `⚠️ Unusual spending detected for user ${userId}: ₹${amount}`
        );
      }

      console.log("AI Analysis:", mlResult);
    } else {
      // For income or other types, do not flag as anomaly
      mlResult = {
        risk_level: "NONE",
        final_anomaly_score: 0,
        explanation: "Income credited regularly"
      };
    }
  } catch (error) {
    console.error("ML analysis failed:", error.message);
  }

  // Save transaction with AI results (null-safe defaults)
  const transactionId = await transactionModel.createTransaction(
    userId,
    type,
    amount,
    category,
    description,
    date,
    mlResult
  );

  return transactionId;
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