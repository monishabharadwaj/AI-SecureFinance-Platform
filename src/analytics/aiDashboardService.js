const transactionModel = require("../models/transactionModel");
const analyticsService = require("./analyticsService");
const aiPredictor = require("../ai/aiPredictor");
const { generateInsights } = require("../services/insightsService");

const getAIDashboard = async (userId) => {

  // Fetch analytics data
  const summary = await analyticsService.getSummary(userId);
  const categories = await analyticsService.getCategoryBreakdown(userId);
  const monthly = await analyticsService.getMonthlySummary(userId);

  // Fetch transactions
  const transactions = await transactionModel.getTransactionsByUser(userId);

  if (!transactions || transactions.length === 0) {
    const insights = await generateInsights(userId, summary, categories, null);
    return {
      summary,
      categories,
      monthly,
      predicted_next_spending: null,
      recent_transactions: [],
      ai_flagged_transactions: [],
      insights
    };
  }

  // Sort transactions chronologically
  const sortedTransactions = transactions.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Build sequence for prediction - use monthly totals instead of individual transactions
  const monthlyTotals = await analyticsService.getMonthlySummary(userId);
  let sequence = [];
  
  if (monthlyTotals && monthlyTotals.length > 0) {
    // Use last 6 months of expense data for prediction
    sequence = monthlyTotals
      .slice(-6)
      .map(month => month.expense)
      .filter(amount => amount > 0);
  }
  
  // If no monthly data, fall back to recent transaction averages
  if (sequence.length === 0) {
    const recentTransactions = sortedTransactions.slice(-30);
    if (recentTransactions.length > 0) {
      const avgDailySpend = recentTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0) / recentTransactions.length;
      // Estimate monthly spending based on recent average
      sequence = [avgDailySpend * 30]; // Rough monthly estimate
    }
  }

  let prediction = null;

  try {
    if (sequence.length > 0) {
      prediction = await aiPredictor.predictSpending(sequence);
    }
  } catch (err) {
    console.error("Prediction failed:", {
      message: err.message,
      endpoint: "http://127.0.0.1:8000/predict_spending",
      statusCode: err.response?.status,
      details: err.response?.data
    });
  }

  // Get recent transactions
  const recentTransactions = sortedTransactions.slice(-5);

  // Get AI flagged transactions
  const flaggedTransactions = transactions.filter(
    t => t.ai_risk_level === "HIGH"
  );

  // Generate AI insights
  const insights = await generateInsights(userId, summary, categories, prediction);

  return {
    summary,
    categories,
    monthly,
    predicted_next_spending: prediction,
    recent_transactions: recentTransactions,
    ai_flagged_transactions: flaggedTransactions,
    insights
  };

};

module.exports = {
  getAIDashboard
};
