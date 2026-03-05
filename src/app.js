require('./config/env');

const express = require('express');
const authRoutes = require('./auth/authRoutes');
const verifyToken = require('./middleware/jwtMiddleware');
const errorHandler = require('./middleware/errorMiddleware');
const transactionRoutes = require('./finance/transactions/transactionRoutes');
const analyticsRoutes = require('./analytics/analyticsRoutes');

const app = express();

app.use(express.json());

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);

// Test protected route
app.get('/api/protected', verifyToken, (req, res) => {
    res.json({
        message: "Access granted",
        user: req.user
    });
});

// Error handler (always last)
app.use(errorHandler);

module.exports = app;