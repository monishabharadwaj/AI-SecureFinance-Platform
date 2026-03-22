const budgetService = require('./budgetService');
const db = require('../../config/db');

const createBudget = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Frontend sends 'budgetAmount' due to Budget interface definition
    const amount = req.body.budgetAmount || req.body.amount;
    const { category, period, icon } = req.body;
    
    // Note: 'icon' is ignored for now as it's not in the DB schema
    const budget = await budgetService.createBudget(userId, category, amount, period);
    res.status(201).json({ success: true, message: "Budget created", data: budget });
  } catch (err) {
    if (err.message) return res.status(400).json({ success: false, message: err.message, error: err.message });
    next(err);
  }
};

const getBudgets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const budgets = await budgetService.getUserBudgets(userId);
    
    const mapped = budgets.map(b => ({
      id: b.id || b.category,
      category: b.category,
      budgetAmount: b.amount,
      spentAmount: b.spent || 0,
      period: b.period || 'monthly',
      icon: b.icon || '🍕'
    }));
    
    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

const updateBudget = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; 
    const amount = req.body.budgetAmount || req.body.amount;
    const { category, period, icon } = req.body;
    
    const query = `UPDATE budgets SET category = ?, amount = ?, period = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;
    await db.execute(query, [category, amount, period, id, userId]);
    
    res.json({ success: true, message: "Budget updated" });
  } catch (err) {
    if (err.message) return res.status(400).json({ success: false, message: err.message, error: err.message });
    next(err);
  }
};

const deleteBudget = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const query = `DELETE FROM budgets WHERE id = ? AND user_id = ?`;
    await db.execute(query, [id, userId]);
    
    res.json({ success: true, message: "Budget deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget
};