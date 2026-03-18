const analyticsService = require("../analytics/analyticsService");
const budgetService = require("../finance/budgets/budgetService");

const financialAdvisorService = {
  // Comprehensive spending analysis
  analyzeSpending: async (userId, summary, categories) => {
    const insights = [];
    const totalExpense = summary.total_expense || 0;
    const totalIncome = summary.total_income || 0;

    if (!categories.expenses) return insights;

    // Find top spending categories
    const sortedCategories = Object.entries(categories.expenses)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (sortedCategories.length > 0) {
      const [topCategory, amount] = sortedCategories[0];
      const percent = ((amount / totalExpense) * 100).toFixed(1);
      insights.push(`Most of your spending this month has gone toward ${topCategory}, which accounts for ${percent}% of your total expenses.`);
    }

    // Analyze spending patterns
    if (totalIncome > 0) {
      const spendingRatio = (totalExpense / totalIncome * 100).toFixed(1);
      if (spendingRatio > 90) {
        insights.push(`Your spending uses ${spendingRatio}% of your income. Consider reducing expenses to build savings.`);
      } else if (spendingRatio < 50) {
        insights.push(`Great! You're only using ${spendingRatio}% of your income, leaving room for savings and investments.`);
      }
    }

    // Check for high discretionary spending
    const discretionaryCategories = ['entertainment', 'shopping', 'dining out', 'subscriptions'];
    const discretionarySpending = discretionaryCategories.reduce((sum, cat) => {
      return sum + (categories.expenses[cat] || 0);
    }, 0);

    if (discretionarySpending > totalExpense * 0.3) {
      insights.push(`Your discretionary spending (entertainment, shopping, dining) is high. Consider cutting back by 10-20% to boost savings.`);
    }

    return insights;
  },

  // Savings guidance and calculations
  provideSavingsGuidance: async (userId, summary, categories) => {
    const insights = [];
    const totalExpense = summary.total_expense || 0;
    const totalIncome = summary.total_income || 0;
    const currentBalance = summary.balance || 0;

    if (totalIncome === 0) return insights;

    // Calculate current savings rate
    const savingsRate = (currentBalance / totalIncome * 100).toFixed(1);
    
    if (savingsRate > 20) {
      insights.push(`Excellent! You're saving ${savingsRate}% of your income, which is above the recommended 20%.`);
    } else if (savingsRate > 10) {
      insights.push(`Good progress! You're saving ${savingsRate}% of your income. Aim for 20% for optimal financial health.`);
    } else if (savingsRate > 0) {
      insights.push(`You're saving ${savingsRate}% of your income. Try to increase this to at least 10-20% for better financial security.`);
    } else {
      insights.push(`You're not currently saving. Consider reducing expenses by 10-15% to start building an emergency fund.`);
    }

    // Project monthly savings
    const projectedMonthlySavings = currentBalance;
    if (projectedMonthlySavings > 0) {
      insights.push(`Based on your current spending pattern, you could save around ₹${projectedMonthlySavings.toFixed(0)} this month.`);
    }

    // Suggest specific savings opportunities
    if (categories.expenses) {
      const potentialSavings = [];
      
      // Check entertainment spending
      if (categories.expenses.entertainment > 1000) {
        const saving = (categories.expenses.entertainment * 0.3).toFixed(0);
        potentialSavings.push(`Reduce entertainment by ₹${saving} monthly`);
      }
      
      // Check shopping spending
      if (categories.expenses.shopping > 2000) {
        const saving = (categories.expenses.shopping * 0.2).toFixed(0);
        potentialSavings.push(`Cut shopping expenses by ₹${saving} monthly`);
      }

      // Check food/dining spending
      if (categories.expenses.food > 3000) {
        const saving = (categories.expenses.food * 0.15).toFixed(0);
        potentialSavings.push(`Save ₹${saving} on food by cooking more at home`);
      }

      if (potentialSavings.length > 0) {
        const totalPotential = potentialSavings.reduce((sum, text) => {
          const amount = parseFloat(text.match(/₹(\d+)/)[1]);
          return sum + amount;
        }, 0);
        insights.push(`If you implement these changes, you could save an additional ₹${totalPotential.toFixed(0)} per month.`);
      }
    }

    return insights;
  },

  // Advanced budget monitoring
  monitorBudgets: async (userId, categories) => {
    const insights = [];
    
    try {
      const budgets = await budgetService.getUserBudgets(userId);
      
      if (!budgets || budgets.length === 0) {
        insights.push(`Set up monthly budgets for better expense tracking and control.`);
        return insights;
      }

      const warnings = [];
      const suggestions = [];

      budgets.forEach(budget => {
        const spent = categories.expenses?.[budget.category] || 0;
        const usagePercent = budget.amount > 0 ? (spent / budget.amount * 100) : 0;

        if (usagePercent >= 90) {
          warnings.push(`You have already used ${usagePercent.toFixed(0)}% of your ${budget.category} budget. Stop spending in this category.`);
        } else if (usagePercent >= 75) {
          warnings.push(`You have used ${usagePercent.toFixed(0)}% of your ${budget.category} budget. Be careful with remaining expenses.`);
        } else if (usagePercent >= 50) {
          suggestions.push(`${usagePercent.toFixed(0)}% of ${budget.category} budget used. You're on track.`);
        }

        // Suggest budget adjustments if consistently over/under
        if (usagePercent > 110) {
          suggestions.push(`Consider increasing your ${budget.category} budget by 20% or reducing spending.`);
        } else if (usagePercent < 50 && spent > 0) {
          suggestions.push(`You could reduce your ${budget.category} budget by 25% based on current spending.`);
        }
      });

      insights.push(...warnings, ...suggestions);
    } catch (error) {
      console.error("Budget monitoring error:", error);
    }

    return insights;
  },

  // Financial planning advice
  provideFinancialPlanning: async (userId, summary, categories, monthly) => {
    const insights = [];
    const totalIncome = summary.total_income || 0;
    const currentBalance = summary.balance || 0;

    // Emergency fund advice
    if (currentBalance > 0) {
      const monthlyExpenses = summary.total_expense || 0;
      const emergencyFundMonths = currentBalance / monthlyExpenses;
      
      if (emergencyFundMonths >= 6) {
        insights.push(`Great! You have ${emergencyFundMonths.toFixed(1)} months of expenses saved as emergency fund.`);
      } else if (emergencyFundMonths >= 3) {
        insights.push(`Good progress! You have ${emergencyFundMonths.toFixed(1)} months of emergency fund. Aim for 6 months.`);
      } else {
        insights.push(`Build an emergency fund of 3-6 months expenses. Start with ₹1,000-₹2,000 monthly.`);
      }
    }

    // Income diversification advice
    if (categories.income && Object.keys(categories.income).length === 1) {
      insights.push(`Consider diversifying your income sources beyond ${Object.keys(categories.income)[0]} for better financial security.`);
    }

    // Investment suggestions (basic)
    if (currentBalance > 10000) {
      insights.push(`With ₹${currentBalance.toFixed(0)} in savings, consider low-risk investments like fixed deposits or mutual funds.`);
    }

    // Debt management advice
    if (categories.expenses?.loan_payments > 0) {
      const loanToIncome = (categories.expenses.loan_payments / totalIncome * 100).toFixed(1);
      if (loanToIncome > 30) {
        insights.push(`Your loan payments are ${loanToIncome}% of income. Focus on reducing high-interest debt first.`);
      }
    }

    return insights;
  },

  // Trip budget planner
  planTripBudget: async (userId, tripDetails, summary, categories) => {
    const insights = [];
    const { destination, duration, travelers = 1 } = tripDetails;
    const totalIncome = summary.total_income || 0;
    const monthlyExpenses = summary.total_expense || 0;
    const currentBalance = summary.balance || 0;

    // Calculate available funds for trip
    const availableForTrip = Math.min(
      currentBalance * 0.5,  // Use max 50% of current balance
      (totalIncome - monthlyExpenses) * 3  // Or 3 months of surplus
    );

    // Estimate trip costs based on destination type
    let estimatedCost = 0;
    let costBreakdown = {};

    if (destination.toLowerCase().includes('international') || 
        !['domestic', 'local', 'india'].includes(destination.toLowerCase())) {
      // International trip estimates
      estimatedCost = travelers * (30000 + duration * 5000);
      costBreakdown = {
        travel: estimatedCost * 0.4,
        accommodation: estimatedCost * 0.3,
        food: estimatedCost * 0.15,
        transportation: estimatedCost * 0.1,
        activities: estimatedCost * 0.05
      };
    } else {
      // Domestic trip estimates
      estimatedCost = travelers * (10000 + duration * 2000);
      costBreakdown = {
        travel: estimatedCost * 0.3,
        accommodation: estimatedCost * 0.35,
        food: estimatedCost * 0.2,
        transportation: estimatedCost * 0.1,
        activities: estimatedCost * 0.05
      };
    }

    // Provide recommendations
    if (estimatedCost <= availableForTrip) {
      insights.push(`Based on your monthly income of ₹${totalIncome} and current expenses of ₹${monthlyExpenses}, you can safely afford this ${destination} trip.`);
      insights.push(`Recommended budget: ₹${estimatedCost.toFixed(0)} for ${travelers} traveler(s) for ${duration} days.`);
    } else if (estimatedCost <= availableForTrip * 1.5) {
      insights.push(`This trip would stretch your budget. Consider saving for 2-3 months or reducing the trip duration.`);
      insights.push(`You need ₹${(estimatedCost - availableForTrip).toFixed(0)} more to afford this trip comfortably.`);
    } else {
      insights.push(`This trip budget exceeds your current financial capacity. Consider postponing or choosing a more affordable destination.`);
      insights.push(`Recommended saving goal: Save ₹${estimatedCost.toFixed(0)} over 6 months for this trip.`);
    }

    // Provide cost breakdown
    insights.push(`Suggested budget breakdown: Travel (₹${costBreakdown.travel.toFixed(0)}), Accommodation (₹${costBreakdown.accommodation.toFixed(0)}), Food (₹${costBreakdown.food.toFixed(0)}), Local transport (₹${costBreakdown.transportation.toFixed(0)}), Activities (₹${costBreakdown.activities.toFixed(0)})`);

    // Cost-saving suggestions
    insights.push(`To reduce costs: Book flights in advance, choose budget accommodations, use public transport, and look for free activities.`);

    return insights;
  }
};

module.exports = financialAdvisorService;
