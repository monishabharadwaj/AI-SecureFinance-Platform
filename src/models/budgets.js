const db = require('../config/db');

const budgetModel = {
  // Create a new budget
  async createBudget(userId, category, amount, period = 'monthly') {
    const query = `
      INSERT INTO budgets (user_id, category, amount, period, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, category) 
      DO UPDATE SET 
        amount = excluded.amount,
        period = excluded.period,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    try {
      const [result] = await db.execute(query, [userId, category, amount, period]);
      return result;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  },

  // Get all budgets for a user
  async getUserBudgets(userId) {
    const query = `
      SELECT * FROM budgets 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    
    try {
      const [rows] = await db.execute(query, [userId]);
      return rows;
    } catch (error) {
      console.error('Error getting user budgets:', error);
      throw error;
    }
  },

  // Get budget by category for a user
  async getBudgetByCategory(userId, category) {
    const query = `
      SELECT * FROM budgets 
      WHERE user_id = ? AND category = ?
    `;
    
    try {
      const [rows] = await db.execute(query, [userId, category]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error getting budget by category:', error);
      throw error;
    }
  },

  // Update budget
  async updateBudget(userId, category, amount, period) {
    const query = `
      UPDATE budgets 
      SET amount = ?, period = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND category = ?
      RETURNING *
    `;
    
    try {
      const [result] = await db.execute(query, [amount, period, userId, category]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  },

  // Delete budget
  async deleteBudget(userId, category) {
    const query = `
      DELETE FROM budgets 
      WHERE user_id = ? AND category = ?
    `;
    
    try {
      const [result] = await db.execute(query, [userId, category]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  },

  // Get budget spending for current period
  async getBudgetSpending(userId, category, period = 'monthly') {
    let dateCondition = '';
    
    if (period === 'monthly') {
      dateCondition = 'AND DATE(t.date) >= DATE(DATE_SUB(NOW(), INTERVAL 1 MONTH))';
    } else if (period === 'weekly') {
      dateCondition = 'AND DATE(t.date) >= DATE(DATE_SUB(NOW(), INTERVAL 1 WEEK))';
    } else if (period === 'yearly') {
      dateCondition = 'AND DATE(t.date) >= DATE(DATE_SUB(NOW(), INTERVAL 1 YEAR))';
    }
    
    const query = `
      SELECT COALESCE(SUM(t.amount), 0) as spent
      FROM transactions t
      WHERE t.user_id = ? 
        AND t.category = ?
        AND t.type = 'expense'
        ${dateCondition}
    `;
    
    try {
      const [rows] = await db.execute(query, [userId, category]);
      return rows[0].spent;
    } catch (error) {
      console.error('Error getting budget spending:', error);
      throw error;
    }
  }
};

module.exports = budgetModel;