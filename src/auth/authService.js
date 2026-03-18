const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userModel = require('../models/userModel');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');

const register = async (name, email, password) => {
  const existingUser = await userModel.findByEmail(email);
  if (existingUser) throw new Error('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = await userModel.createUser(name, email, hashedPassword);

  return { id: userId, name, email };
};

const login = async (email, password) => {
  const user = await userModel.findByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid credentials');

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { accessToken, refreshToken };
};

const forgotPassword = async (email) => {
  const user = await userModel.findByEmail(email);
  if (!user) throw new Error('User not found');

  const resetToken = crypto.randomBytes(32).toString('hex');
  await userModel.setResetToken(email, resetToken);

  return { 
    message: 'Reset token generated',
    resetToken 
  };
};

const resetPassword = async (token, newPassword) => {
  const user = await userModel.findByResetToken(token);
  if (!user) throw new Error('Invalid token');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userModel.updatePassword(user.id, hashedPassword);

  return { message: 'Password reset successful' };
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword
};