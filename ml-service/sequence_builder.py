import numpy as np

def create_sequences(data, seq_length=10):
    """
    Legacy function for univariate sequences (single feature).
    Kept for backward compatibility.
    """
    if len(data) <= seq_length:
        raise ValueError("Data length must be greater than sequence length")

    X = []
    y = []

    for i in range(len(data) - seq_length):
        X.append(data[i:i + seq_length])
        y.append(data[i + seq_length])

    X = np.array(X)
    y = np.array(y)

    return X, y


def create_multivariate_sequences(data, seq_length=10):
    """
    Create sequences from multivariate data.
    
    Args:
        data: 2D array where each row is [amount, category_encoded, type_encoded, day_of_week]
        seq_length: Length of each sequence (default 10)
    
    Returns:
        X: Array of shape (num_sequences, seq_length, 4)
        y: Array of target values (next amount to predict)
    """
    X = []
    y = []

    for i in range(len(data) - seq_length):
        X.append(data[i:i+seq_length])
        # predict next amount (first feature)
        y.append(data[i+seq_length][0])

    return np.array(X), np.array(y)