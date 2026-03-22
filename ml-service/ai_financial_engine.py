import statistics
from datetime import datetime
from collections import defaultdict


class FinancialAIEngine:

    def __init__(self):
        pass


    # ------------------------------
    # Basic Spending Behaviour
    # ------------------------------
    def analyze_spending_behavior(self, transactions):

        amounts = [t["amount"] for t in transactions]

        avg = statistics.mean(amounts)
        median = statistics.median(amounts)
        max_spend = max(amounts)
        min_spend = min(amounts)

        insights = []

        insights.append(
            f"On average you spend about ₹{avg:.0f} per transaction."
        )

        insights.append(
            f"Most of your everyday purchases are around ₹{median:.0f}."
        )

        if max_spend > avg * 3:
            insights.append(
                f"One of your purchases (₹{max_spend:.0f}) is much higher than your usual spending."
            )

        insights.append(
            f"Your smaller purchases are usually around ₹{min_spend:.0f}."
        )

        return insights


    # ------------------------------
    # Category Insights
    # ------------------------------
    def analyze_categories(self, transactions):

        category_totals = defaultdict(float)

        for t in transactions:
            category = t.get("category", "other")
            category_totals[category] += t["amount"]

        sorted_categories = sorted(
            category_totals.items(),
            key=lambda x: x[1],
            reverse=True
        )

        insights = []

        if not sorted_categories:
            return insights

        top_category, amount = sorted_categories[0]

        insights.append(
            f"Most of your spending recently has gone toward {top_category}, "
            f"with a total of about ₹{amount:.0f}."
        )

        if len(sorted_categories) > 1:
            second, amt = sorted_categories[1]

            insights.append(
                f"The next largest category is {second}, "
                f"where you've spent around ₹{amt:.0f}."
            )

        return insights


    # ------------------------------
    # Weekly Spending Trends
    # ------------------------------
    def analyze_spending_trends(self, transactions):

        weekly_spending = defaultdict(float)

        for t in transactions:

            date = datetime.fromisoformat(t["date"])
            week = date.isocalendar()[1]

            weekly_spending[week] += t["amount"]

        weeks = sorted(weekly_spending.keys())

        insights = []

        if len(weeks) < 2:
            return insights

        last_week = weekly_spending[weeks[-1]]
        prev_week = weekly_spending[weeks[-2]]

        if prev_week == 0:
            return insights

        change = ((last_week - prev_week) / prev_week) * 100

        if abs(change) > 200:
            insights.append(
                "Your spending this week is significantly higher than last week."
            )

        elif change > 10:
            insights.append(
                f"Your spending this week is about {change:.0f}% higher than last week."
            )

        elif change < -10:
            insights.append(
                f"Your spending this week is about {abs(change):.0f}% lower than last week."
            )

        else:
            insights.append(
                "Your spending this week looks fairly similar to last week."
            )

        return insights


    # ------------------------------
    # Budget Advice
    # ------------------------------
    def generate_advice(self, transactions):

        amounts = [t["amount"] for t in transactions]

        avg = statistics.mean(amounts)
        max_spend = max(amounts)

        advice = []

        if max_spend > avg * 3:
            advice.append(
                "Large purchases seem to occur occasionally. "
                "Planning these ahead could help stabilize your spending."
            )

        if avg > 1000:
            advice.append(
                "Your average spending per transaction is relatively high. "
                "You might benefit from reviewing recurring expenses."
            )

        return advice


    # ------------------------------
    # Master Insight Generator
    # ------------------------------
    def generate_full_financial_report(self, transactions):
        income_total = sum(t["amount"] for t in transactions if t.get("type", "expense").lower() in ["income", "credit"])
        expense_total = sum(t["amount"] for t in transactions if t.get("type", "expense").lower() in ["expense", "debit"])
        
        cats = defaultdict(float)
        for t in transactions:
            if t.get("type", "expense").lower() in ["expense", "debit"]:
                cats[t.get("category", "other")] += t["amount"]
                
        sorted_cats = sorted(cats.items(), key=lambda x: x[1], reverse=True)
        top_cat = f"{sorted_cats[0][0]} (₹{sorted_cats[0][1]:.0f})" if sorted_cats else "None"
        
        amounts = [t["amount"] for t in transactions if t.get("type", "expense").lower() in ["expense", "debit"]]
        avg = statistics.mean(amounts) if amounts else 0
        unusual = [a for a in amounts if a > avg * 3]
        unusual_str = f"Found {len(unusual)} unusually large transaction(s) > ₹{avg*3:.0f}" if unusual else "None"

        summary = f"**Summary**\n• Total Transactions: {len(transactions)}\n• Total Income: ₹{income_total:.0f}\n• Total Expenses: ₹{expense_total:.0f}"
        key_insights = f"**Key Insights**\n• Top Spending Category: {top_cat}\n• Unusual Transactions: {unusual_str}"
        
        recs = []
        if expense_total > income_total:
            recs.append("• 🚨 Reduce discretionary spending to stop cash bleed.")
        else:
            recs.append("• 📈 Great job keeping expenses under income! Consider routing surplus to an emergency fund.")
            
        if unusual:
            recs.append("• ⚠️ Review your unusually large purchases to see if they were strictly necessary.")
            
        if sorted_cats and sorted_cats[0][1] > expense_total * 0.4:
            recs.append(f"• ✂️ Try to cut back on {sorted_cats[0][0]}, which makes up more than 40% of your expenses.")
            
        if not recs:
            recs.append("• Maintain your current healthy financial habits.")

        recommendations = "**Recommendations**\n" + "\n".join(recs)

        return [summary, key_insights, recommendations]


    # ------------------------------
    # Chatbot Response Engine
    # ------------------------------
    def answer_question(self, question, transactions):
        question_lower = question.lower()
        
        income_total = sum(t["amount"] for t in transactions if t.get("type", "").lower() in ["income", "credit"])
        expense_total = sum(t["amount"] for t in transactions if t.get("type", "expense").lower() in ["expense", "debit"])
        savings = income_total - expense_total
        
        cats = defaultdict(float)
        for t in transactions:
            if t.get("type", "expense").lower() in ["expense", "debit"]:
                cats[t.get("category", "other").lower()] += t["amount"]
                
        # 1. Category specific queries
        for cat in cats.keys():
            if cat in question_lower and (any(w in question_lower for w in ["spend", "much", "cost", "pay"])):
                amt = cats[cat]
                pct = (amt / expense_total * 100) if expense_total > 0 else 0
                return f"You have spent **₹{amt:.0f}** on **{cat.title()}**, which is about **{pct:.1f}%** of your total expenses. {'This is quite high!' if pct > 30 else 'This seems reasonable.'}"

        # 2. General reduction
        if any(w in question_lower for w in ["reduce", "cut", "lower", "decrease", "save more"]):
            top_cat = sorted(cats.items(), key=lambda x: x[1], reverse=True)[0] if cats else None
            if not top_cat: return "I don't see any expenses to reduce yet."
            return f"To reduce your expenses, start with your largest category: **{top_cat[0].title()}** (₹{top_cat[1]:.0f}). Try setting a strict budget for it or finding cheaper alternatives. Review your recurring subscriptions!"
            
        # 3. Largest expense / biggest
        if any(w in question_lower for w in ["largest", "biggest", "highest", "most", "top"]):
            if not cats: return "You haven't recorded any expenses yet."
            top_cat = sorted(cats.items(), key=lambda x: x[1], reverse=True)[0]
            expense_txs = [t for t in transactions if t.get("type", "expense").lower() in ["expense", "debit"]]
            max_tx = max(expense_txs, key=lambda x: x["amount"], default=None)
            res = f"Your highest spending category is **{top_cat[0].title()}** at ₹{top_cat[1]:.0f}.\n\n"
            if max_tx:
                res += f"Your single largest transaction was **{max_tx['description']}** for ₹{max_tx['amount']:.0f}."
            return res
            
        # 4. Savings status
        if any(w in question_lower for w in ["saving", "save", "enough", "good", "bad"]):
            rate = (savings / income_total * 100) if income_total > 0 else 0
            if rate > 20: return f"You are saving **₹{savings:.0f}** ({rate:.1f}% of income). That's excellent! Keep it up."
            elif rate > 0: return f"You are saving **₹{savings:.0f}** ({rate:.1f}% of income). Consider aiming for the 20% rule by cutting down on {sorted(cats.items(), key=lambda x: x[1], reverse=True)[0][0].title() if cats else 'discretionary'} spending."
            return f"You are currently spending more than you earn (Deficit: ₹{abs(savings):.0f})! Immediate budgeting is required."
            
        # 5. Original exact match fallbacks
        if "spending analysis" in question_lower or "spending" in question_lower:
            if not transactions: return "I need more data to analyze your spending."
            top_cats = sorted(cats.items(), key=lambda x: x[1], reverse=True)[:3]
            cat_str = ", ".join([f"{c[0].title()} (₹{c[1]:.0f})" for c in top_cats]) if top_cats else "None"
            trends = self.analyze_spending_trends(transactions)
            trend_str = trends[0] if trends else 'Stable'
            return f"**Spending Analysis:**\n- **Total Spent:** ₹{expense_total:.0f}\n- **Top Categories:** {cat_str}\n- **Trend:** {trend_str}"
            
        elif "investment advice" in question_lower or "invest" in question_lower:
            if savings > 5000:
                return f"**Investment Advice:**\nYou have a surplus of ₹{savings:.0f}. Consider diversifying:\n- **50%** into low-risk Index Funds/ETFs.\n- **30%** into Fixed Deposits or Bonds.\n- **20%** into Stocks depending on your risk appetite."
            elif savings > 0:
                return f"**Investment Advice:**\nYou have ₹{savings:.0f} available. Before heavy investing, build an **Emergency Fund** covering 3-6 months of expenses in a high-yield savings account."
            else:
                return "**Investment Advice:**\nCurrently, your expenses exceed your income. Focus on **debt reduction** and **budgeting** before looking into investments."
                
        # 6. Default Fallback Contextual Responder
        return f"Based on your profile, you've earned ₹{income_total:.0f} and spent ₹{expense_total:.0f} this month. Is there a specific category or transaction you'd like me to analyze for you? (e.g. 'How much did I spend on food?' or 'What is my biggest expense?')"