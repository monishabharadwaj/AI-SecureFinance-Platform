const express = require('express');
const router = express.Router();
const axios = require('axios');
const verifyToken = require('../middleware/jwtMiddleware');
const analyticsService = require('../analytics/analyticsService');
const financialAdvisorService = require('../services/financialAdvisorService');
const financialGoalsModel = require('../models/financialGoals');
const tripPlanningModel = require('../models/tripPlanning');

const ML_SERVICE_URL = "http://127.0.0.1:8000";

// AI Financial Chatbot
router.post("/chat", verifyToken, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await axios.post(`${ML_SERVICE_URL}/financial_chat`, {
      message
    });

    res.json(response.data);
  } catch (error) {
    console.error("AI Chatbot Error:", error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      res.status(500).json({ 
        error: "AI service is currently unavailable. Please try again later." 
      });
    } else {
      res.status(500).json({ 
        error: "Failed to process chat request" 
      });
    }
  }
});

// Comprehensive Financial Advice
router.post("/financial-advice", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's financial data
    const summary = await analyticsService.getSummary(userId);
    const categories = await analyticsService.getCategoryBreakdown(userId);
    const monthly = await analyticsService.getMonthlySummary(userId);

    const insights = [];

    // Get comprehensive advice from financial advisor
    const spendingInsights = await financialAdvisorService.analyzeSpending(userId, summary, categories);
    const savingsInsights = await financialAdvisorService.provideSavingsGuidance(userId, summary, categories);
    const budgetInsights = await financialAdvisorService.monitorBudgets(userId, categories);
    const planningInsights = await financialAdvisorService.provideFinancialPlanning(userId, summary, categories, monthly);

    insights.push(...spendingInsights, ...savingsInsights, ...budgetInsights, ...planningInsights);

    res.json({
      summary,
      categories,
      insights,
      recommendations: insights.filter(insight => 
        insight.includes('reduce') || 
        insight.includes('increase') || 
        insight.includes('consider') ||
        insight.includes('save')
      )
    });
  } catch (error) {
    console.error("Financial Advice Error:", error);
    res.status(500).json({ error: "Failed to generate financial advice" });
  }
});

// Trip Budget Planner
router.post("/trip-planner", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { destination, duration, travelers = 1 } = req.body;

    if (!destination || !duration) {
      return res.status(400).json({ error: "Destination and duration are required" });
    }

    // Get user's financial data
    const summary = await analyticsService.getSummary(userId);
    const categories = await analyticsService.getCategoryBreakdown(userId);

    const tripDetails = { destination, duration, travelers };
    const insights = await financialAdvisorService.planTripBudget(userId, tripDetails, summary, categories);

    res.json({
      destination,
      duration,
      travelers,
      insights,
      affordable: insights.some(insight => insight.includes('can safely afford')),
      estimatedBudget: insights.find(insight => insight.includes('Recommended budget'))
    });
  } catch (error) {
    console.error("Trip Planner Error:", error);
    res.status(500).json({ error: "Failed to plan trip budget" });
  }
});

// Financial Goals Management
router.post("/savings-goals", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, targetAmount, currentAmount = 0, deadline, category = 'general' } = req.body;

    if (!title || !targetAmount) {
      return res.status(400).json({ error: "Title and target amount are required" });
    }

    const goalId = await financialGoalsModel.createGoal(userId, title, targetAmount, currentAmount, deadline, category);
    
    res.status(201).json({
      message: "Financial goal created successfully",
      goalId,
      title,
      targetAmount,
      currentAmount,
      deadline,
      category
    });
  } catch (error) {
    console.error("Create Goal Error:", error);
    res.status(500).json({ error: "Failed to create financial goal" });
  }
});

router.get("/savings-goals", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const goals = await financialGoalsModel.getUserGoals(userId);
    const stats = await financialGoalsModel.getGoalStats(userId);
    const nearingDeadline = await financialGoalsModel.getGoalsNearingDeadline(userId, 30);

    res.json({
      goals,
      stats,
      nearingDeadline,
      totalGoals: goals.length,
      completedGoals: stats.completed_goals
    });
  } catch (error) {
    console.error("Get Goals Error:", error);
    res.status(500).json({ error: "Failed to get financial goals" });
  }
});

router.put("/savings-goals/:goalId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;
    const { currentAmount } = req.body;

    if (!currentAmount) {
      return res.status(400).json({ error: "Current amount is required" });
    }

    const updated = await financialGoalsModel.updateGoalProgress(goalId, currentAmount);
    
    if (!updated) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.json({ message: "Goal progress updated successfully" });
  } catch (error) {
    console.error("Update Goal Error:", error);
    res.status(500).json({ error: "Failed to update goal progress" });
  }
});

// Trip Planning Management
router.post("/trip-plans", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { destination, startDate, endDate, travelers, estimatedBudget, budgetBreakdown } = req.body;

    if (!destination || !startDate || !endDate || !travelers) {
      return res.status(400).json({ error: "Destination, dates, and travelers are required" });
    }

    const tripId = await tripPlanningModel.createTripPlan(userId, destination, startDate, endDate, travelers, estimatedBudget, budgetBreakdown);
    
    res.status(201).json({
      message: "Trip plan created successfully",
      tripId,
      destination,
      startDate,
      endDate,
      travelers,
      estimatedBudget
    });
  } catch (error) {
    console.error("Create Trip Plan Error:", error);
    res.status(500).json({ error: "Failed to create trip plan" });
  }
});

router.get("/trip-plans", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const trips = await tripPlanningModel.getUserTripPlans(userId);
    const upcomingTrips = await tripPlanningModel.getUpcomingTrips(userId, 90);
    const stats = await tripPlanningModel.getTripStats(userId);

    res.json({
      trips,
      upcomingTrips,
      stats,
      totalTrips: trips.length,
      upcomingCount: upcomingTrips.length
    });
  } catch (error) {
    console.error("Get Trip Plans Error:", error);
    res.status(500).json({ error: "Failed to get trip plans" });
  }
});

// Budget Optimization Suggestions
router.post("/budget-optimization", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's financial data
    const summary = await analyticsService.getSummary(userId);
    const categories = await analyticsService.getCategoryBreakdown(userId);

    const insights = [];
    const optimizations = [];

    // Analyze spending patterns
    if (categories.expenses) {
      Object.entries(categories.expenses).forEach(([category, amount]) => {
        const percent = ((amount / summary.total_expense) * 100).toFixed(1);
        
        if (percent > 30) {
          optimizations.push({
            category,
            currentAmount: amount,
            suggestedReduction: amount * 0.2,
            reason: `${category} is ${percent}% of total expenses`
          });
        }
      });
    }

    // Suggest budget reallocations
    if (summary.balance > 0) {
      const savingsPotential = summary.balance * 0.5;
      optimizations.push({
        category: 'savings',
        suggestedIncrease: savingsPotential,
        reason: 'Allocate half of current balance to savings'
      });
    }

    res.json({
      insights,
      optimizations,
      totalPotentialSavings: optimizations.reduce((sum, opt) => 
        sum + (opt.suggestedReduction || 0), 0
      )
    });
  } catch (error) {
    console.error("Budget Optimization Error:", error);
    res.status(500).json({ error: "Failed to generate budget optimization" });
  }
});

module.exports = router;
