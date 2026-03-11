import statistics
from datetime import datetime
from collections import defaultdict


class InsightsEngine:

    def __init__(self):
        pass


    # -------------------------------------
    # Basic Spending Behaviour
    # -------------------------------------
    def analyze_spending_behavior(self, transactions):

        if len(transactions) < 3:
            return []

        amounts = [t["amount"] for t in transactions]

        avg = statistics.mean(amounts)
        median = statistics.median(amounts)
        max_spend = max(amounts)
        min_spend = min(amounts)

        insights = []

        insights.append(
            f"On average you spend around ₹{avg:.0f} per transaction."
        )

        insights.append(
            f"Most of your regular purchases are close to ₹{median:.0f}."
        )

        insights.append(
            f"Your smallest recent expense was ₹{min_spend:.0f}, while your largest was ₹{max_spend:.0f}."
        )

        return insights


    # -------------------------------------
    # Category Insights
    # -------------------------------------
    def analyze_categories(self, transactions):

        category_totals = defaultdict(float)

        for t in transactions:
            category = t.get("category", "other")
            category_totals[category] += t["amount"]

        if not category_totals:
            return []

        sorted_categories = sorted(
            category_totals.items(),
            key=lambda x: x[1],
            reverse=True
        )

        insights = []

        top_category, amount = sorted_categories[0]

        insights.append(
            f"Most of your spending recently has gone toward {top_category}, "
            f"with a total of about ₹{amount:.0f}."
        )

        if len(sorted_categories) > 1:
            second, amt = sorted_categories[1]

            insights.append(
                f"The next largest category is {second}, "
                f"where you've spent roughly ₹{amt:.0f}."
            )

        return insights


    # -------------------------------------
    # Large Purchase Detection
    # -------------------------------------
    def detect_large_purchases(self, transactions):

        amounts = [t["amount"] for t in transactions]

        avg = statistics.mean(amounts)
        max_spend = max(amounts)

        insights = []

        if max_spend > avg * 3:

            insights.append(
                f"A recent purchase of ₹{max_spend:.0f} is much higher than your usual spending."
            )

            insights.append(
                "Large purchases like this can sometimes push your weekly spending higher than expected."
            )

        return insights


    # -------------------------------------
    # Spending Stability
    # -------------------------------------
    def analyze_spending_stability(self, transactions):

        amounts = [t["amount"] for t in transactions]

        if len(amounts) < 4:
            return []

        variance = statistics.pvariance(amounts)
        avg = statistics.mean(amounts)

        insights = []

        if variance > avg:

            insights.append(
                "Your spending varies quite a bit between transactions."
            )

            insights.append(
                "Keeping track of bigger purchases might help keep your spending more predictable."
            )

        else:

            insights.append(
                "Your spending pattern looks fairly consistent across recent transactions."
            )

        return insights


    # -------------------------------------
    # Weekly Spending Trends
    # -------------------------------------
    def analyze_spending_trends(self, transactions):

        weekly_spending = defaultdict(float)

        for t in transactions:

            if "date" not in t:
                continue

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

        if change > 10:

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


    # -------------------------------------
    # Master Insight Generator
    # -------------------------------------
    def generate_insights(self, transactions):

        insights = []

        insights.extend(self.analyze_spending_behavior(transactions))
        insights.extend(self.analyze_categories(transactions))
        insights.extend(self.detect_large_purchases(transactions))
        insights.extend(self.analyze_spending_stability(transactions))
        insights.extend(self.analyze_spending_trends(transactions))

        return insights