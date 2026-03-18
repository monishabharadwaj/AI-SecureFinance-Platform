const jwt = require('jsonwebtoken');
const env = require('../config/env');

const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;
  
  if (!header) {
    return res.status(401).json({ 
      message: 'Access denied. No token provided.' 
    });
  }

  const token = header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      message: 'Invalid token format. Use: Bearer <token>' 
    });
  }

  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired. Please refresh.' 
      });
    }
    res.status(403).json({ 
      message: 'Invalid token' 
    });
  }
};

module.exports = verifyToken;