from __future__ import annotations

"""
Centralized feature engineering utilities for the ML service.

These helpers standardize transaction data and build feature views that are
reused across:
- LSTM spending prediction
- Autoencoder anomaly detection
- Isolation Forest anomaly detection
- Behavioural KMeans clustering
"""

from dataclasses import dataclass
from typing import Iterable, Tuple

import numpy as np
import pandas as pd

from features import ensure_amount_column, to_1d_array


@dataclass(frozen=True)
class TransactionFeatures:
    """
    Container for common transaction feature views.

    All attributes are derived from the same underlying dataframe to guarantee
    consistency across models.
    """

    base_df: pd.DataFrame

    # Univariate series for LSTM and autoencoder (amount only).
    amount_series: np.ndarray

    # Per-transaction dataframe for IsolationForest.
    isolation_df: pd.DataFrame


def standardize_transactions(df: pd.DataFrame) -> pd.DataFrame:
    """
    Standardize raw transaction dataframe:
    - Normalize amount column name
    - Ensure 'date' uses pandas datetime if present
    """
    df = ensure_amount_column(df).copy()

    # Normalize date column naming if present
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date")
    elif "Date" in df.columns:
        df["Date"] = pd.to_datetime(df["Date"])
        df = df.sort_values("Date")

    return df


def build_transaction_features(df: pd.DataFrame) -> TransactionFeatures:
    """
    Build a set of standard feature views from a raw transaction dataframe.

    - amount_series: 1D numpy array of amounts (sorted by time if date is present)
    - isolation_df: dataframe with a single 'amount' column for IsolationForest
    """
    df_std = standardize_transactions(df)

    # Amount time-series as 1D array
    amount_series = to_1d_array(df_std["amount"].values)

    # IsolationForest expects a 2D feature matrix; we keep as DataFrame for clarity.
    isolation_df = pd.DataFrame({"amount": df_std["amount"].values})

    return TransactionFeatures(
        base_df=df_std,
        amount_series=amount_series,
        isolation_df=isolation_df,
    )


def build_user_aggregation(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate per-user behavioural features for KMeans clustering.

    Expects:
        df with columns: user_id, amount (Amount is also accepted and normalized)

    Returns:
        DataFrame with columns:
        - avg_amount
        - transaction_count
        - total_spending
    """
    df = standardize_transactions(df)
    if "user_id" not in df.columns:
        raise KeyError("Expected 'user_id' column for behavioural clustering")

    features = pd.DataFrame()
    features["avg_amount"] = df.groupby("user_id")["amount"].mean()
    features["transaction_count"] = df.groupby("user_id")["amount"].count()
    features["total_spending"] = df.groupby("user_id")["amount"].sum()
    return features

