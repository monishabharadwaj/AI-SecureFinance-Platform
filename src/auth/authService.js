const bcrypt = require('bcrypt');
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

module.exports = {
  register,
  login
};