const db = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await db.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await db.execute(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};

const createUser = async (name, email, passwordHash) => {
  const [result] = await db.execute(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, passwordHash]
  );

  return result.insertId;
};

const setResetToken = async (email, resetToken) => {
  const [result] = await db.execute(
    'UPDATE users SET reset_token = ? WHERE email = ?',
    [resetToken, email]
  );
  return result.affectedRows > 0;
};

const findByResetToken = async (resetToken) => {
  const [rows] = await db.execute(
    'SELECT * FROM users WHERE reset_token = ?',
    [resetToken]
  );
  return rows[0];
};

const updatePassword = async (userId, hashedPassword) => {
  const [result] = await db.execute(
    'UPDATE users SET password = ?, reset_token = NULL WHERE id = ?',
    [hashedPassword, userId]
  );
  return result.affectedRows > 0;
};

const clearResetToken = async (resetToken) => {
  const [result] = await db.execute(
    'UPDATE users SET reset_token = NULL WHERE reset_token = ?',
    [resetToken]
  );
  return result.affectedRows > 0;
};

module.exports = {
  findByEmail,
  findById,
  createUser,
  setResetToken,
  findByResetToken,
  updatePassword,
  clearResetToken
};