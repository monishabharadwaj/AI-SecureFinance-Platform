const budgetModel = require('../../models/budgets');

const budgetService = {
  // Create or update a budget
  async createBudget(userId, category, amount, period = 'monthly') {
    if (!category || !amount || amount <= 0) {
      throw new Error('Category and valid amount are required');
    }

    return await budgetModel.createBudget(userId, category, amount, period);
  },

  // Get all budgets for a user with spending information
  async getUserBudgets(userId) {
    const budgets = await budgetModel.getUserBudgets(userId);
    
    // Add spending information to each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await budgetModel.getBudgetSpending(
          userId, 
          budget.category, 
          budget.period
        );
        
        const remaining = budget.amount - spent;
        const usagePercent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
        
        return {
          ...budget,
          spent: parseFloat(spent),
          remaining: parseFloat(remaining),
          usage_percent: parseFloat(usagePercent.toFixed(1)),
          is_over_budget: spent > budget.amount,
          is_near_limit: usagePercent >= 80 && usagePercent < 100
        };
      })
    );

    return budgetsWithSpending;
  },

  // Get budget by category with spending information
  async getBudgetByCategory(userId, category) {
    const budget = await budgetModel.getBudgetByCategory(userId, category);
    
    if (!budget) {
      return null;
    }

    const spent = await budgetModel.getBudgetSpending(
      userId, 
      budget.category, 
      budget.period
    );
    
    const remaining = budget.amount - spent;
    const usagePercent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    
    return {
      ...budget,
      spent: parseFloat(spent),
      remaining: parseFloat(remaining),
      usage_percent: parseFloat(usagePercent.toFixed(1)),
      is_over_budget: spent > budget.amount,
      is_near_limit: usagePercent >= 80 && usagePercent < 100
    };
  },

  // Update a budget
  async updateBudget(userId, category, amount, period) {
    if (!category || !amount || amount <= 0) {
      throw new Error('Category and valid amount are required');
    }

    const updatedBudget = await budgetModel.updateBudget(userId, category, amount, period);
    
    if (!updatedBudget) {
      throw new Error('Budget not found');
    }

    return updatedBudget;
  },

  // Delete a budget
  async deleteBudget(userId, category) {
    const deleted = await budgetModel.deleteBudget(userId, category);
    
    if (!deleted) {
      throw new Error('Budget not found');
    }

    return true;
  },

  // Get budget alerts/insights
  async getBudgetAlerts(userId) {
    const budgets = await this.getUserBudgets(userId);
    const alerts = [];

    budgets.forEach(budget => {
      if (budget.is_over_budget) {
        alerts.push({
          type: 'over_budget',
          category: budget.category,
          message: `You have exceeded your ${budget.category} budget by ${Math.abs(budget.remaining).toFixed(2)}.`,
          severity: 'high'
        });
      } else if (budget.is_near_limit) {
        alerts.push({
          type: 'near_limit',
          category: budget.category,
          message: `You have used ${budget.usage_percent}% of your ${budget.category} budget.`,
          severity: 'medium'
        });
      }
    });

    return alerts;
  }
};

module.exports = budgetService;