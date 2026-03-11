from __future__ import annotations

"""
Offline evaluation utilities for core ML models.

This module does NOT alter runtime behaviour. It helps you:
- Inspect LSTM prediction accuracy on the Kaggle-style dataset
- Inspect autoencoder reconstruction error statistics
- Derive sensible anomaly thresholds
"""

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import torch
from sklearn.metrics import mean_absolute_error, mean_squared_error

from config import LSTM_CONFIG, AUTOENCODER_CONFIG, MODELS_DIR
from kaggle_loader import load_kaggle_dataset
from kaggle_preprocess import preprocess_kaggle_data
from sequence_builder import create_sequences
from lstm_model import SpendingLSTM
from autoencoder_detector import AutoencoderDetector


def evaluate_lstm_on_kaggle() -> dict:
    """
    Evaluate the trained LSTM model using the same Kaggle-style dataset.
    """
    df = load_kaggle_dataset()
    df = preprocess_kaggle_data(df)

    # Ensure chronological order
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values("Date")

    # Load trained artifacts
    if not LSTM_CONFIG.model_path.exists() or not LSTM_CONFIG.scaler_path.exists():
        raise FileNotFoundError("LSTM model or scaler not found; run train_model.py first.")

    model = SpendingLSTM(
        input_size=1,
        hidden_size=LSTM_CONFIG.hidden_size,
        num_layers=LSTM_CONFIG.num_layers,
    )
    state = torch.load(str(LSTM_CONFIG.model_path), map_location="cpu")
    model.load_state_dict(state)
    model.eval()

    scaler = joblib.load(str(LSTM_CONFIG.scaler_path))

    features = df[["Amount"]].values
    scaled = scaler.transform(features)

    X, y = create_sequences(scaled.flatten(), seq_length=LSTM_CONFIG.seq_length)
    X = torch.tensor(X).float().unsqueeze(-1)
    y = torch.tensor(y).float()

    split = int(len(X) * 0.8)
    X_test = X[split:]
    y_test = y[split:]

    with torch.no_grad():
        preds = model(X_test)

    y_true = y_test.numpy()
    y_pred = preds.detach().squeeze().numpy()

    mse = mean_squared_error(y_true, y_pred)
    rmse = mse ** 0.5
    mae = mean_absolute_error(y_true, y_pred)

    report = {
        "test_samples": int(len(y_test)),
        "seq_length": LSTM_CONFIG.seq_length,
        "mse": float(mse),
        "rmse": float(rmse),
        "mae": float(mae),
    }

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = MODELS_DIR / "lstm_eval_report.json"
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    return report


def load_autoencoder_stats() -> dict | None:
    """
    Load reconstruction-error statistics computed during autoencoder training.
    """
    if not AUTOENCODER_CONFIG.stats_path.exists():
        return None
    with AUTOENCODER_CONFIG.stats_path.open("r", encoding="utf-8") as f:
        return json.load(f)


def suggest_autoencoder_thresholds(stats: dict) -> dict:
    """
    Given autoencoder error stats, suggest anomaly thresholds.

    These are heuristic and should be validated against real labelled data
    when available.
    """
    mean_err = stats.get("mean_error")
    p95 = stats.get("p95_error")
    p99 = stats.get("p99_error")

    return {
        "normal_max": p95,
        "caution_min": p95,
        "caution_max": p99,
        "anomaly_min": p99,
        "mean_error": mean_err,
    }


def quick_autoencoder_sweep() -> list[dict]:
    """
    Run a small sweep of amounts through the trained autoencoder detector
    to visualize how error grows with distance from the training range.
    """
    # Example synthetic training data, mirroring test_autoencoder.py
    df = pd.DataFrame({"amount": [100, 120, 130, 150, 170, 200, 250]})

    detector = AutoencoderDetector()
    detector.train(df)

    results = []
    for amt in np.linspace(100, 5000, 10):
        err = detector.detect(float(amt))
        results.append({"amount": float(amt), "reconstruction_error": float(err)})

    return results


if __name__ == "__main__":
    print("=== LSTM evaluation on Kaggle-style dataset ===")
    try:
        lstm_report = evaluate_lstm_on_kaggle()
        print(lstm_report)
    except FileNotFoundError as exc:
        print("Skipping LSTM evaluation:", exc)

    print("\n=== Autoencoder error statistics ===")
    stats = load_autoencoder_stats()
    if stats is None:
        print("No autoencoder_stats.json found; run autoencoder training first.")
    else:
        print(stats)
        print("\nSuggested thresholds:")
        print(suggest_autoencoder_thresholds(stats))

    print("\n=== Autoencoder error sweep (synthetic) ===")
    sweep = quick_autoencoder_sweep()
    for row in sweep:
        print(row)

