const analyticsService = require('./analyticsService');

const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await analyticsService.getSummary(userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await analyticsService.getCategoryBreakdown(userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getMonthly = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await analyticsService.getMonthlySummary(userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSummary,
  getCategories,
  getMonthly
};