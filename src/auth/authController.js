const authService = require('./authService');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { generateAccessToken } = require('../utils/tokenUtils');
const userModel = require('../models/userModel');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await authService.register(name, email, password);
    
    // Generate tokens for new user
    const tokens = await authService.login(email, password);
    
    // Get user info without password
    const userWithoutPassword = { id: user.id, name: user.name, email: user.email };
    
    res.status(201).json({ 
      accessToken: tokens.accessToken, 
      refreshToken: tokens.refreshToken,
      user: userWithoutPassword
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const tokens = await authService.login(email, password);
    
    // Get user info without password
    const user = await userModel.findByEmail(email);
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ 
      accessToken: tokens.accessToken, 
      refreshToken: tokens.refreshToken,
      user: userWithoutPassword
    });
  } catch (err) {
    next(err);
  }
};

const refreshToken = (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid refresh token' });

    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  });
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const result = await authService.forgotPassword(email);
    res.json(result);
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const result = await authService.resetPassword(token, newPassword);
    res.json(result);
  } catch (err) {
    if (err.message === 'Invalid token') {
      return res.status(400).json({ message: 'Invalid token' });
    }
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Get user info without password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;
    
    await userModel.updateProfile(userId, name, phone);
    
    const updatedUser = await userModel.findById(userId);
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile
};