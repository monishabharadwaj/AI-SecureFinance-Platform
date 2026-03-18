const transactionModel = require("../models/transactionModel");

const getSummary = async (userId) => {
  const transactions = await transactionModel.getTransactionsByUser(userId);
  
  if (!transactions || transactions.length === 0) {
    return {
      total_income: 0,
      total_expense: 0,
      balance: 0,
      avg_transaction: 0,
      transaction_count: 0
    };
  }

  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const balance = totalIncome - totalExpense;
  const avgTransaction = transactions.length > 0 ? 
    transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0) / transactions.length : 0;

  return {
    total_income: totalIncome,
    total_expense: totalExpense,
    balance: balance,
    avg_transaction: avgTransaction,
    transaction_count: transactions.length
  };
};

const getCategoryBreakdown = async (userId) => {
  const transactions = await transactionModel.getTransactionsByUser(userId);
  
  if (!transactions || transactions.length === 0) {
    return {
      income: {},
      expenses: {}
    };
  }

  const incomeBreakdown = {};
  const expenseBreakdown = {};
  
  for (const t of transactions) {
    const category = (t.category || "uncategorized").toLowerCase();
    
    if (t.type === 'income') {
      if (!incomeBreakdown[category]) {
        incomeBreakdown[category] = 0;
      }
      incomeBreakdown[category] = incomeBreakdown[category] + parseFloat(t.amount);
    } else if (t.type === 'expense') {
      if (!expenseBreakdown[category]) {
        expenseBreakdown[category] = 0;
      }
      expenseBreakdown[category] = expenseBreakdown[category] + parseFloat(t.amount);
    }
  }

  return {
    income: incomeBreakdown,
    expenses: expenseBreakdown
  };
};

const getMonthlySummary = async (userId) => {
  const transactions = await transactionModel.getTransactionsByUser(userId);
  
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const monthlySummary = {};

  for (const t of transactions) {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlySummary[monthKey]) {
      monthlySummary[monthKey] = {
        month: monthKey,
        income: 0,
        expense: 0,
        balance: 0
      };
    }
    
    if (t.type === 'income') {
      monthlySummary[monthKey].income += parseFloat(t.amount);
    } else if (t.type === 'expense') {
      monthlySummary[monthKey].expense += parseFloat(t.amount);
    }
  }

  // Calculate balance for each month
  Object.values(monthlySummary).forEach(month => {
    month.balance = month.income - month.expense;
  });

  return Object.values(monthlySummary).sort((a, b) => a.month.localeCompare(b.month));
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlySummary
};
