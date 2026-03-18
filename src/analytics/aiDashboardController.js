const aiDashboardService = require("./aiDashboardService");

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const dashboard = await aiDashboardService.getAIDashboard(userId);

    res.json(dashboard);

  } catch (err) {
    console.error("AI Dashboard Error:", err);
    next(err);
  }
};

module.exports = {
  getDashboard
};
