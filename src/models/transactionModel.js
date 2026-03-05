const db = require('../config/db');

const createTransaction = async (userId, type, amount, category, description, date) => {
  const [result] = await db.execute(
    `INSERT INTO transactions 
    (user_id, type, amount, category, description, date) 
    VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, type, amount, category, description, date]
  );

  return result.insertId;
};

const getTransactionsByUser = async (userId) => {
  const [rows] = await db.execute(
    `SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC`,
    [userId]
  );

  return rows;
};

const deleteTransaction = async (transactionId, userId) => {
  await db.execute(
    `DELETE FROM transactions WHERE id = ? AND user_id = ?`,
    [transactionId, userId]
  );
};

module.exports = {
  createTransaction,
  getTransactionsByUser,
  deleteTransaction
};