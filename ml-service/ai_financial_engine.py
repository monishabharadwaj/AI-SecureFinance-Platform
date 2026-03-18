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

        insights = []

        insights.extend(self.analyze_spending_behavior(transactions))
        insights.extend(self.analyze_categories(transactions))
        insights.extend(self.analyze_spending_trends(transactions))
        insights.extend(self.generate_advice(transactions))

        return insights


    # ------------------------------
    # Chatbot Response Engine
    # ------------------------------
    def answer_question(self, question, transactions):

        question = question.lower()

        if "spending the most" in question or "where do i spend" in question:
            return self.analyze_categories(transactions)[0]

        if "average" in question:
            avg = statistics.mean([t["amount"] for t in transactions])
            return f"Your average spending per transaction is around ₹{avg:.0f}."

        if "trend" in question:
            trends = self.analyze_spending_trends(transactions)
            if trends:
                return trends[0]

        if "advice" in question or "save money" in question:
            advice = self.generate_advice(transactions)
            if advice:
                return advice[0]

        return "I couldn't find a clear answer to that yet, but I'm still learning from your spending patterns."