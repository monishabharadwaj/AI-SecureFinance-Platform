import torch
import numpy as np
import joblib
import locale
from pathlib import Path
from lstm_model import SpendingLSTM

def format_indian_rupees(amount):
    """Format amount as Indian Rupees with ₹ symbol and proper comma separation"""
    try:
        # Try to set Indian locale
        locale.setlocale(locale.LC_NUMERIC, 'en_IN')
        formatted = locale.format_string("%.2f", amount, grouping=True)
        return f"₹{formatted}"
    except locale.Error:
        # Fallback formatting if Indian locale not available
        formatted = "{:,.2f}".format(amount)
        return f"₹{formatted}"

def load_model():
    """Load the trained univariate LSTM model (Amount time-series)"""
    # Cache artifacts to avoid re-loading on every request.
    global _CACHED_MODEL, _CACHED_SCALER
    if _CACHED_MODEL is not None and _CACHED_SCALER is not None:
        return _CACHED_MODEL

    artifact_dir = Path(__file__).resolve().parent
    model_path = artifact_dir / "multivariate_lstm_model.pth"
    scaler_path = artifact_dir / "feature_scaler.pkl"

    model = SpendingLSTM(input_size=1, hidden_size=64, num_layers=2)
    model.load_state_dict(torch.load(str(model_path), map_location="cpu"))
    model.eval()

    _CACHED_MODEL = model
    _CACHED_SCALER = joblib.load(str(scaler_path))
    return model


# Module-level caches (avoid repeated disk IO in production)
_CACHED_MODEL = None
_CACHED_SCALER = None


def predict_next(sequence):
    """
    Predict next spending amount from a univariate sequence.

    Args:
        sequence: List or array of spending amounts

    Returns:
        float: predicted spending amount
    """

    model = load_model()

    # Load cached scaler
    scaler = _CACHED_SCALER

    # Convert to numpy array
    sequence = np.array(sequence).reshape(-1, 1)

    # Normalize
    sequence_scaled = scaler.transform(sequence)

    # Convert to tensor
    tensor = torch.tensor(sequence_scaled).float().unsqueeze(0)

    # Predict
    with torch.no_grad():
        pred = model(tensor)

    pred_scaled = pred.item()

    # Inverse transform
    dummy_row = np.array([[pred_scaled]])
    pred_actual = scaler.inverse_transform(dummy_row)[0, 0]

    return float(pred_actual)
