import pandas as pd

def load_kaggle_dataset():

    df = pd.read_csv("credit_card_spending.csv")

    print("Dataset Loaded")
    print(df.head())

    return df