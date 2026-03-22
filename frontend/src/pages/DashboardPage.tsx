import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/services/api";
import { useFinanceStore } from "@/stores/financeStore";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  Brain,
  RefreshCw,
  Activity,
  BarChart3,
  Lightbulb,
  Wallet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { safeToLocaleString, formatCurrency } from "@/utils/format";
import type { AIDashboardData, CategoryEntry, MonthlyEntry, NormalisedSummary } from "@/types/finance";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { AnomalyAlerts } from "@/components/dashboard/AnomalyAlerts";

// Normalisation helpers
function normaliseCategoryData(raw: AIDashboardData["categories"]): CategoryEntry[] {
  if (!raw || typeof raw !== "object") return [];
  const expenseMap: Record<string, number> = raw.expenses && typeof raw.expenses === "object" ? raw.expenses : {};
  const total = Object.values(expenseMap).reduce((sum, v) => sum + (v || 0), 0);
  return Object.entries(expenseMap)
    .filter(([, amount]) => amount > 0)
    .map(([name, amount]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      trend: "stable" as const,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function normaliseMonthlyData(raw: AIDashboardData["monthly"]): MonthlyEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => ({
    month: entry.month,
    income: entry.income ?? 0,
    expenses: entry.expense ?? 0,
    savings: (entry.income ?? 0) - (entry.expense ?? 0),
  }));
}

function normaliseSummary(raw: AIDashboardData["summary"]): NormalisedSummary {
  const income = raw?.total_income ?? 0;
  const expense = raw?.total_expense ?? 0;
  const balance = raw?.balance ?? income - expense;
  const savingsRate = income > 0 ? (balance / income) * 100 : 0;
  return {
    total_income: income,
    total_expenses: expense,
    balance,
    savings_rate: savingsRate,
    health_score: savingsRate >= 20 ? 80 : savingsRate >= 10 ? 60 : 40,
    avg_transaction: raw?.avg_transaction ?? 0,
    transaction_count: raw?.transaction_count ?? 0,
  };
}

function normaliseConfidence(confidence: number): number {
  return confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence);
}

function getInsightIcon(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("spend") || lower.includes("expense") || lower.includes("budget")) return <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />;
  if (lower.includes("income") || lower.includes("salary")) return <TrendingUp className="h-4 w-4 text-success mt-0.5" />;
  if (lower.includes("save") || lower.includes("saving")) return <Wallet className="h-4 w-4 text-primary mt-0.5" />;
  if (lower.includes("predict")) return <Activity className="h-4 w-4 text-violet-500 mt-0.5" />;
  return <Lightbulb className="h-4 w-4 text-primary mt-0.5" />;
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<AIDashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Zustand fetches for UI widgets
  const { budgets, goals, fetchBudgets, fetchGoals } = useFinanceStore();

  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true);
      setError(null);
      const data = await apiClient.getAIDashboard();
      setDashboardData(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard");
      toast({ title: "Dashboard Error", description: err?.message, variant: "destructive" });
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    fetchBudgets();
    fetchGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (dashboardLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Dashboard</h1><RefreshCw className="h-5 w-5 animate-spin" /></div>
        <div className="grid grid-cols-4 gap-4"><Card className="h-24 animate-pulse bg-muted" /><Card className="h-24 animate-pulse bg-muted" /><Card className="h-24 animate-pulse bg-muted" /><Card className="h-24 animate-pulse bg-muted" /></div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
        <p className="text-lg">{error ?? "Dashboard failed to load"}</p>
        <Button onClick={loadDashboardData} className="mt-4">Retry</Button>
      </div>
    );
  }

  const summary = normaliseSummary(dashboardData.summary);
  const categoryEntries = normaliseCategoryData(dashboardData.categories);
  const monthlyEntries = normaliseMonthlyData(dashboardData.monthly);
  const insights: string[] = Array.isArray(dashboardData.insights) ? dashboardData.insights : [];
  const recentTransactions = Array.isArray(dashboardData.recent_transactions) ? dashboardData.recent_transactions : [];
  const prediction = dashboardData.predicted_next_spending ?? null;
  const flaggedTransactions = (Array.isArray(dashboardData.ai_flagged_transactions) ? dashboardData.ai_flagged_transactions : [])
        .filter((t: any) => t.type !== 'income' && t.type !== 'credit');

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Your automated financial intelligence report</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadDashboardData}><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
      </div>

      {flaggedTransactions.length > 0 && <AnomalyAlerts flaggedTransactions={flaggedTransactions} />}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card p-5 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
            <div className="flex justify-between items-center z-10 relative">
              <div>
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Net Balance</p>
                <p className="text-3xl font-bold mt-1 tracking-tight text-primary">₹{safeToLocaleString(summary.balance)}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl"><DollarSign className="h-6 w-6 text-primary" /></div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Total Income</p>
                <p className="text-2xl font-bold mt-1 text-success">₹{safeToLocaleString(summary.total_income)}</p>
              </div>
              <div className="p-3 bg-success/10 rounded-xl"><TrendingUp className="h-5 w-5 text-success" /></div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Total Expenses</p>
                <p className="text-2xl font-bold mt-1 text-destructive">₹{safeToLocaleString(summary.total_expenses)}</p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-xl"><TrendingDown className="h-5 w-5 text-destructive" /></div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Savings Rate</p>
                <p className="text-2xl font-bold mt-1">{summary.savings_rate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-xl"><Target className="h-5 w-5 text-warning" /></div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Charts (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card className="glass-card p-6">
              <h3 className="text-lg font-display font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Monthly Cashflow
              </h3>
              <IncomeExpenseChart data={monthlyEntries} />
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <Card className="glass-card p-6">
              <h3 className="text-lg font-display font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Spending by Category
              </h3>
              <CategoryBarChart data={categoryEntries} />
              
              {/* Spending Insights Banner embedded inside the chart card */}
              {categoryEntries.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-muted/40 border flex items-start gap-3">
                   <Lightbulb className="h-5 w-5 text-warning mt-0.5" />
                   <div>
                     <p className="text-sm font-semibold">Spending Highlight</p>
                     <p className="text-xs text-muted-foreground mt-1">
                       Your top expense this month is <strong className="text-foreground">{categoryEntries[0].name}</strong>, accounting for <strong className="text-foreground">{categoryEntries[0].percentage}%</strong> of your total categorized spending.
                     </p>
                   </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Trackers & Insights (1/3 width) */}
        <div className="space-y-6">
          
          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
            <Card className="glass-card p-6">
              <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Goal Progress
              </h3>
              {goals.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No active goals found.</p>
              ) : (
                <div className="space-y-4">
                  {goals.slice(0,3).map(g => {
                    const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                    return (
                      <div key={g.id}>
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-sm font-medium flex items-center gap-2">{g.icon} {g.title}</span>
                          <span className="text-xs text-muted-foreground">{pct}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full ${pct >= 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
            <Card className="glass-card p-6">
              <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" /> Budget Usage
              </h3>
              {budgets.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No active budgets found.</p>
              ) : (
                <div className="space-y-4">
                  {budgets.slice(0,3).map(b => {
                    const pct = Math.min(100, Math.round((b.spentAmount / b.budgetAmount) * 100));
                    const isOver = pct >= 90;
                    return (
                      <div key={b.id}>
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-sm font-medium flex items-center gap-2">{b.icon} {b.category}</span>
                          <span className="text-xs text-muted-foreground">₹{safeToLocaleString(b.spentAmount)} / {safeToLocaleString(b.budgetAmount)}</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full ${isOver ? 'bg-destructive' : 'bg-success'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </motion.div>

          {/* AI Insights specific card overlay */}
          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
            <Card className="glass-card p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
              <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" /> AI Insights
              </h3>
              {insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.slice(0,4).map((insight, idx) => (
                    <div key={idx} className="flex gap-3 text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      {getInsightIcon(insight)}
                      <span className="text-muted-foreground leading-relaxed">{insight}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">More transactions needed for AI to generate intelligent recommendations.</p>
              )}
            </Card>
          </motion.div>

        </div>
      </div>

      {recentTransactions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <RecentTransactions transactions={recentTransactions} />
        </motion.div>
      )}
    </div>
  );
}
