const analyticsService = require("./analyticsService");

const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const summary = await analyticsService.getSummary(userId);
    res.json(summary);
  } catch (err) {
    console.error("Analytics Summary Error:", err);
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const categories = await analyticsService.getCategoryBreakdown(userId);
    res.json(categories);
  } catch (err) {
    console.error("Category Breakdown Error:", err);
    next(err);
  }
};

const getMonthly = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const monthly = await analyticsService.getMonthlySummary(userId);
    res.json(monthly);
  } catch (err) {
    console.error("Monthly Summary Error:", err);
    next(err);
  }
};

module.exports = {
  getSummary,
  getCategories,
  getMonthly
};
