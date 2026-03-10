
import pandas as pd
from sklearn.preprocessing import LabelEncoder

# simple kaggle preprocessing as per updated instructions

def preprocess_kaggle_data(df):
    """Minimal cleaning: drop duplicates, sort by time, reset index."""
    # remove duplicates if any
    df = df.drop_duplicates()

    # order chronologically (important for time-series)
    if "Time" in df.columns:
        df = df.sort_values("Time")

    # reset index after sorting/dropping
    df = df.reset_index(drop=True)

    return df


def preprocess_transactions(df):
    """
    Preprocess transaction data with encoding and feature extraction.
    
    Args:
        df: DataFrame with transaction data
        
    Returns:
        Preprocessed DataFrame with encoded features and extracted temporal features
    """
    df = df.copy()

    # Encode category
    cat_encoder = LabelEncoder()
    df['category_encoded'] = cat_encoder.fit_transform(df['category'].astype(str))

    # Encode type (income/expense)
    type_encoder = LabelEncoder()
    df['type_encoded'] = type_encoder.fit_transform(df['type'])

    # Convert date to datetime
    df['date'] = pd.to_datetime(df['date'])

    # Extract day of week
    df['day_of_week'] = df['date'].dt.dayofweek

    return df