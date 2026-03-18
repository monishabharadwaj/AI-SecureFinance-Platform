const analyticsService = require("../analytics/analyticsService");
const budgetService = require("../finance/budgets/budgetService");
const financialAdvisorService = require("./financialAdvisorService");

const generateInsights = async (userId, summary, categories, prediction = null) => {
  const insights = [];

  if (!summary || !categories) {
    return insights;
  }

  // Get comprehensive financial advice from advisor service
  try {
    // Spending Analysis
    const spendingInsights = await financialAdvisorService.analyzeSpending(userId, summary, categories);
    insights.push(...spendingInsights);

    // Savings Guidance
    const savingsInsights = await financialAdvisorService.provideSavingsGuidance(userId, summary, categories);
    insights.push(...savingsInsights);

    // Budget Monitoring
    const budgetInsights = await financialAdvisorService.monitorBudgets(userId, categories);
    insights.push(...budgetInsights);

    // Financial Planning
    const planningInsights = await financialAdvisorService.provideFinancialPlanning(userId, summary, categories, null);
    insights.push(...planningInsights);

  } catch (error) {
    console.error("Financial advisor service error:", error);
    // Fallback to basic insights if advisor service fails
    insights.push("Financial advisor service temporarily unavailable. Basic insights shown.");
  }

  // Add basic insights as fallback
  const totalExpense = summary.total_expense || 0;
  const totalIncome = summary.total_income || 0;

  // Transaction insights - conversational
  if (summary.transaction_count > 15) {
    insights.push(`🔄 Lots of transactions this month (${summary.transaction_count}) - maybe review small purchases?`);
  } else if (summary.transaction_count > 10) {
    insights.push(`📝 You've been busy with ${summary.transaction_count} transactions this month`);
  }

  // Average transaction insights - relatable
  if (summary.avg_transaction > 5000) {
    insights.push(`💸 Your average purchase is ₹${summary.avg_transaction.toFixed(0)} - that's quite high!`);
  } else if (summary.avg_transaction > 1000) {
    insights.push(`🛍️ Average spend of ₹${summary.avg_transaction.toFixed(0)} per transaction`);
  }

  // Spending trend insights
  try {
    const trendInsights = await generateTrendInsights(userId, summary);
    insights.push(...trendInsights);
  } catch (error) {
    console.error("Trend insights generation failed:", error);
  }

  // Add prediction insight if prediction data is provided
  if (prediction && summary.total_expense > 0) {
    const predicted = prediction;
    const current = summary.total_expense;
    const difference = ((predicted - current) / current * 100).toFixed(1);
    
    if (predicted > current) {
      insights.push(`🔮 AI predicts you'll spend ${Math.abs(difference)}% more next month`);
    } else {
      insights.push(`🔮 AI predicts you'll spend ${Math.abs(difference)}% less next month`);
    }
  }

  return insights;
};

const generateBudgetInsights = async (userId, categories) => {
  const insights = [];
  
  try {
    const budgets = await budgetService.getUserBudgets(userId);
    
    if (!budgets || budgets.length === 0) {
      insights.push(`💡 Pro tip: Set up budgets to track your spending better!`);
      return insights;
    }

    for (const budget of budgets) {
      const categorySpending = categories[budget.category] || 0;
      const budgetAmount = budget.amount;
      
      if (budgetAmount > 0) {
        const usagePercent = (categorySpending / budgetAmount) * 100;
        
        if (usagePercent > 100) {
          insights.push(`🚨 Oops! You went over your ${budget.category} budget by ${Math.round(usagePercent - 100)}%`);
        } else if (usagePercent > 90) {
          insights.push(`⚠️ Almost there! ${Math.round(usagePercent)}% of ${budget.category} budget used`);
        } else if (usagePercent > 80) {
          insights.push(`📊 Watch out: ${Math.round(usagePercent)}% of ${budget.category} budget spent`);
        } else if (usagePercent > 50) {
          insights.push(`✅ Good progress: ${Math.round(usagePercent)}% of ${budget.category} budget used`);
        }
      }
    }
  } catch (error) {
    console.error("Error generating budget insights:", error);
  }
  
  return insights;
};

const generateTrendInsights = async (userId, summary) => {
  const insights = [];
  
  try {
    const monthlyData = await analyticsService.getMonthlySummary(userId);
    
    if (monthlyData && monthlyData.length >= 2) {
      const currentMonth = monthlyData[monthlyData.length - 1];
      const previousMonth = monthlyData[monthlyData.length - 2];
      
      if (currentMonth.expense > previousMonth.expense) {
        const increasePercent = previousMonth.expense > 0 ? 
          ((currentMonth.expense - previousMonth.expense) / previousMonth.expense * 100).toFixed(1) : 0;
        insights.push(`📈 Spending went up ${increasePercent}% this month`);
      } else if (currentMonth.expense < previousMonth.expense) {
        const decreasePercent = previousMonth.expense > 0 ? 
          ((previousMonth.expense - currentMonth.expense) / previousMonth.expense * 100).toFixed(1) : 0;
        insights.push(`🎉 Awesome! Spending down ${decreasePercent}% from last month`);
      }
      
      if (currentMonth.income > previousMonth.income) {
        const increasePercent = previousMonth.income > 0 ? 
          ((currentMonth.income - previousMonth.income) / previousMonth.income * 100).toFixed(1) : 0;
        insights.push(`💰 Income grew ${increasePercent}% - nice!`);
      } else if (currentMonth.income < previousMonth.income) {
        const decreasePercent = previousMonth.income > 0 ? 
          ((previousMonth.income - currentMonth.income) / previousMonth.income * 100).toFixed(1) : 0;
        insights.push(`📉 Income decreased ${decreasePercent}% this month`);
      }
    }
  } catch (error) {
    console.error("Error generating trend insights:", error);
  }
  
  return insights;
};

module.exports = { 
  generateInsights,
  generateBudgetInsights,
  generateTrendInsights
};
