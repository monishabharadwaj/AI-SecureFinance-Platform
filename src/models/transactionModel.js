const db = require('../config/db');

const createTransaction = async (userId, type, amount, category, description, date, aiResult) => {
  const [result] = await db.execute(
    `INSERT INTO transactions 
    (user_id, type, amount, category, description, date, ai_risk_level, anomaly_score, ai_explanation) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, 
      type, 
      amount, 
      category, 
      description, 
      date,
      aiResult?.risk_level || null,
      aiResult?.anomaly_score || null,
      aiResult?.explanation || null
    ]
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

const updateTransactionWithAI = async (transactionId, aiRiskLevel, anomalyScore, aiExplanation) => {
  await db.execute(
    `UPDATE transactions 
    SET ai_risk_level = ?, anomaly_score = ?, ai_explanation = ? 
    WHERE id = ?`,
    [aiRiskLevel, anomalyScore, aiExplanation, transactionId]
  );
};

module.exports = {
  createTransaction,
  getTransactionsByUser,
  deleteTransaction,
  updateTransactionWithAI
};