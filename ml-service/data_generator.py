import numpy as np
import pandas as pd
from datetime import datetime, timedelta


def generate_spending_data(days=365):

    start_date = datetime(2024,1,1)

    dates = []
    amounts = []

    base_spend = 400

    for i in range(days):

        date = start_date + timedelta(days=i)

        weekday = date.weekday()

        spend = base_spend

        # weekend spending increase
        if weekday >= 5:
            spend += np.random.normal(200,50)

        # random daily noise
        spend += np.random.normal(0,80)

        # occasional large purchases
        if np.random.rand() < 0.05:
            spend += np.random.uniform(1000,4000)

        spend = max(50, spend)

        dates.append(date)
        amounts.append(spend)

    df = pd.DataFrame({
        "date": dates,
        "amount": amounts
    })

    return df