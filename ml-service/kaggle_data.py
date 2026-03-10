import pandas as pd

def load_kaggle_dataset():

    df = pd.read_csv("creditcard.csv")

    print("Dataset Loaded")
    print(df.head())

    return df