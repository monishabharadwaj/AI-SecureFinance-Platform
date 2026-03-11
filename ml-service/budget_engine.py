from collections import defaultdict


class BudgetEngine:

    def analyze_budget_usage(self, transactions, budgets):

        category_spending = defaultdict(float)

        for t in transactions:
            category = t.get("category", "other")
            category_spending[category] += t["amount"]

        insights = []

        for category, budget in budgets.items():

            spent = category_spending.get(category, 0)

            usage = (spent / budget) * 100 if budget > 0 else 0

            if usage >= 90:
                insights.append(
                    f"You've almost reached your {category} budget, using about {usage:.0f}% of it."
                )

            elif usage >= 70:
                insights.append(
                    f"You've already used around {usage:.0f}% of your {category} budget."
                )

            elif usage >= 50:
                insights.append(
                    f"You've spent about half of your {category} budget so far."
                )

            else:
                insights.append(
                    f"Your spending for {category} is still comfortably within your budget."
                )

        return insights