import torch
import numpy as np
import joblib
import locale
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

    model = SpendingLSTM()
    model.load_state_dict(torch.load("spending_lstm_model.pth"))
    model.eval()

    return model


def predict_next(sequence):

    model = load_model()

    # Load the scaler
    scaler = joblib.load("scaler.save")

    seq = torch.tensor(sequence).float().unsqueeze(0).unsqueeze(-1)

    prediction = model(seq)

    # Inverse transform to get actual money values
    prediction = scaler.inverse_transform([[prediction.item()]])

    # Format as Indian Rupees
    formatted_prediction = format_indian_rupees(prediction[0][0])

    return formatted_prediction