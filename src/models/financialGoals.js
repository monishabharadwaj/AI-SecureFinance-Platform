const db = require('../config/db');

const financialGoalsModel = {
  // Create a new financial goal
  async createGoal(userId, title, targetAmount, currentAmount = 0, deadline = null, category = 'general') {
    const query = `
      INSERT INTO financial_goals 
      (user_id, title, target_amount, current_amount, deadline, category, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    try {
      const [result] = await db.execute(query, [userId, title, targetAmount, currentAmount, deadline, category]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating financial goal:', error);
      throw error;
    }
  },

  // Get all goals for a user
  async getUserGoals(userId) {
    const query = `
      SELECT *, 
             (current_amount / target_amount * 100) as progress_percentage,
             DATEDIFF(deadline, CURRENT_DATE) as days_remaining
      FROM financial_goals 
      WHERE user_id = 
        AND is_completed = false
      ORDER BY deadline ASC
    `;
    
    try {
      const [rows] = await db.execute(query, [userId]);
      return rows;
    } catch (error) {
      console.error('Error getting user goals:', error);
      throw error;
    }
  },

  // Update goal progress
  async updateGoalProgress(goalId, amount) {
    const query = `
      UPDATE financial_goals 
      SET current_amount = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [amount, goalId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  },

  // Mark goal as completed
  async completeGoal(goalId) {
    const query = `
      UPDATE financial_goals 
      SET is_completed = true, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [goalId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error completing goal:', error);
      throw error;
    }
  },

  // Delete a goal
  async deleteGoal(goalId, userId) {
    const query = `
      DELETE FROM financial_goals 
      WHERE id = ? AND user_id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [goalId, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  // Get goal statistics
  async getGoalStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_goals,
        COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_goals,
        SUM(target_amount) as total_target,
        SUM(current_amount) as total_saved,
        AVG(CASE WHEN is_completed = false THEN (current_amount / target_amount * 100) END) as avg_progress
      FROM financial_goals 
      WHERE user_id = ?
    `;
    
    try {
      const [rows] = await db.execute(query, [userId]);
      return rows[0];
    } catch (error) {
      console.error('Error getting goal stats:', error);
      throw error;
    }
  },

  // Get goals nearing deadline
  async getGoalsNearingDeadline(userId, daysThreshold = 30) {
    const query = `
      SELECT *, 
             (current_amount / target_amount * 100) as progress_percentage,
             DATEDIFF(deadline, CURRENT_DATE) as days_remaining
      FROM financial_goals 
      WHERE user_id = ? 
        AND is_completed = false
        AND DATEDIFF(deadline, CURRENT_DATE) <= ?
        AND DATEDIFF(deadline, CURRENT_DATE) > 0
      ORDER BY days_remaining ASC
    `;
    
    try {
      const [rows] = await db.execute(query, [userId, daysThreshold]);
      return rows;
    } catch (error) {
      console.error('Error getting goals nearing deadline:', error);
      throw error;
    }
  }
};

module.exports = financialGoalsModel;
