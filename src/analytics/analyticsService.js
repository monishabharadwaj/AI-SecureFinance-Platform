const db = require('../config/db');

const getSummary = async (userId) => {
  const [rows] = await db.execute(
    `
    SELECT
      SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as totalIncome,
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as totalExpense
    FROM transactions
    WHERE user_id = ?
    `,
    [userId]
  );

  const income = rows[0].totalIncome || 0;
  const expense = rows[0].totalExpense || 0;

  return {
    totalIncome: income,
    totalExpense: expense,
    balance: income - expense
  };
};

const getCategoryBreakdown = async (userId) => {
  const [rows] = await db.execute(
    `
    SELECT category, SUM(amount) as total
    FROM transactions
    WHERE user_id = ? AND type = 'expense'
    GROUP BY category
    `,
    [userId]
  );

  return rows;
};

const getMonthlySummary = async (userId) => {
  const [rows] = await db.execute(
    `
    SELECT 
      DATE_FORMAT(date,'%Y-%m') as month,
      SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
    FROM transactions
    WHERE user_id = ?
    GROUP BY month
    ORDER BY month
    `,
    [userId]
  );

  return rows;
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlySummary
};