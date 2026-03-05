import pandas as pd

def preprocess_kaggle_data(df):

    df["Date"] = pd.to_datetime(df["Date"])

    df["Amount"] = df["Amount"].astype(float)

    daily_spend = df.groupby("Date")["Amount"].sum().reset_index()

    daily_spend = daily_spend.sort_values("Date")

    print(daily_spend.head())

    return daily_spend