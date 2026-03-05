import pandas as pd
from data_loader import load_transactions


def create_daily_dataset(user_id):

    df = load_transactions(user_id)

    if df.empty:
        return None

    df['date'] = pd.to_datetime(df['date'])

    daily_spend = df.groupby('date')['amount'].sum().reset_index()

    daily_spend = daily_spend.sort_values('date')

    return daily_spend