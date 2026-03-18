const db = require('../config/db');

const tripPlanningModel = {
  // Create a new trip plan
  async createTripPlan(userId, destination, startDate, endDate, travelers, estimatedBudget, budgetBreakdown = {}) {
    const query = `
      INSERT INTO trip_plans 
      (user_id, destination, start_date, end_date, travelers, estimated_budget, budget_breakdown, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'planning', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    try {
      const breakdownJson = JSON.stringify(budgetBreakdown);
      const [result] = await db.execute(query, [userId, destination, startDate, endDate, travelers, estimatedBudget, breakdownJson]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating trip plan:', error);
      throw error;
    }
  },

  // Get all trip plans for a user
  async getUserTripPlans(userId) {
    const query = `
      SELECT *, 
             DATEDIFF(start_date, CURRENT_DATE) as days_until_trip,
             DATEDIFF(end_date, start_date) as duration_days
      FROM trip_plans 
      WHERE user_id = ?
      ORDER BY start_date ASC
    `;
    
    try {
      const [rows] = await db.execute(query, [userId]);
      return rows.map(trip => ({
        ...trip,
        budget_breakdown: JSON.parse(trip.budget_breakdown || '{}')
      }));
    } catch (error) {
      console.error('Error getting user trip plans:', error);
      throw error;
    }
  },

  // Update trip plan
  async updateTripPlan(tripId, userId, updates) {
    const allowedFields = ['destination', 'start_date', 'end_date', 'travelers', 'estimated_budget', 'budget_breakdown', 'status'];
    const updateFields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(key === 'budget_breakdown' ? JSON.stringify(updates[key]) : updates[key]);
      }
    });

    if (updateFields.length === 0) return false;

    values.push(tripId, userId);
    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    const query = `
      UPDATE trip_plans 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND user_id = ?
    `;
    
    try {
      const [result] = await db.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating trip plan:', error);
      throw error;
    }
  },

  // Delete a trip plan
  async deleteTripPlan(tripId, userId) {
    const query = `
      DELETE FROM trip_plans 
      WHERE id = ? AND user_id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [tripId, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting trip plan:', error);
      throw error;
    }
  },

  // Get trip savings progress
  async getTripSavingsProgress(tripId, userId) {
    const query = `
      SELECT tp.*, 
             COALESCE(SUM(t.amount), 0) as saved_amount,
             (COALESCE(SUM(t.amount), 0) / tp.estimated_budget * 100) as savings_percentage
      FROM trip_plans tp
      LEFT JOIN transactions t ON t.user_id = tp.user_id 
        AND t.category = 'trip_savings' 
        AND t.description LIKE CONCAT('%trip_id:', tp.id, '%')
      WHERE tp.id = ? AND tp.user_id = ?
      GROUP BY tp.id
    `;
    
    try {
      const [rows] = await db.execute(query, [tripId, userId]);
      if (rows.length > 0) {
        return {
          ...rows[0],
          budget_breakdown: JSON.parse(rows[0].budget_breakdown || '{}')
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting trip savings progress:', error);
      throw error;
    }
  },

  // Get upcoming trips
  async getUpcomingTrips(userId, daysThreshold = 90) {
    const query = `
      SELECT *, 
             DATEDIFF(start_date, CURRENT_DATE) as days_until_trip,
             DATEDIFF(end_date, start_date) as duration_days
      FROM trip_plans 
      WHERE user_id = ? 
        AND start_date > CURRENT_DATE
        AND DATEDIFF(start_date, CURRENT_DATE) <= ?
      ORDER BY start_date ASC
    `;
    
    try {
      const [rows] = await db.execute(query, [userId, daysThreshold]);
      return rows.map(trip => ({
        ...trip,
        budget_breakdown: JSON.parse(trip.budget_breakdown || '{}')
      }));
    } catch (error) {
      console.error('Error getting upcoming trips:', error);
      throw error;
    }
  },

  // Get trip statistics
  async getTripStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_trips,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_trips,
        COUNT(CASE WHEN status = 'planning' THEN 1 END) as planned_trips,
        SUM(estimated_budget) as total_budget,
        AVG(estimated_budget) as avg_trip_cost
      FROM trip_plans 
      WHERE user_id = ?
    `;
    
    try {
      const [rows] = await db.execute(query, [userId]);
      return rows[0];
    } catch (error) {
      console.error('Error getting trip stats:', error);
      throw error;
    }
  },

  // Add trip savings transaction
  async addTripSavings(userId, tripId, amount) {
    const query = `
      INSERT INTO transactions 
      (user_id, type, amount, category, description, date)
      VALUES (?, 'expense', ?, 'trip_savings', ?, CURRENT_DATE)
    `;
    
    try {
      const description = `Trip savings for trip_id:${tripId}`;
      const [result] = await db.execute(query, [userId, amount, description]);
      return result.insertId;
    } catch (error) {
      console.error('Error adding trip savings:', error);
      throw error;
    }
  }
};

module.exports = tripPlanningModel;
