import torch
import torch.optim as optim
import torch.nn as nn
import joblib
import pandas as pd

from sklearn.preprocessing import MinMaxScaler
from torch.utils.data import DataLoader, TensorDataset
from kaggle_loader import load_kaggle_dataset
from kaggle_preprocess import preprocess_kaggle_data
from sequence_builder import create_sequences
from lstm_model import SpendingLSTM

# Load dataset
df = load_kaggle_dataset()
df = preprocess_kaggle_data(df)

# Sort by date (VERY IMPORTANT for time-series)
df['Date'] = pd.to_datetime(df['Date'])
df = df.sort_values('Date')

# debug checks before training
print("Dataset shape:", df.shape)
print(df.head())
print("Columns:", df.columns)

def train():

    global df

    if df is None or len(df) < 20:
        print("Not enough data to train the model")
        return

    # Normalize Amount (univariate time-series)
    scaler = MinMaxScaler()

    features = df[['Amount']].values

    # Scale to [0, 1] range
    scaled_features = scaler.fit_transform(features)

    # Create univariate sequences
    X, y = create_sequences(scaled_features.flatten(), seq_length=10)

    X = torch.tensor(X).float().unsqueeze(-1)
    y = torch.tensor(y).float()

    # Train/test split
    split = int(len(X) * 0.8)

    X_train = X[:split]
    X_test = X[split:]

    y_train = y[:split]
    y_test = y[split:]

    # Create DataLoader for mini-batch training
    dataset = TensorDataset(X_train, y_train)
    loader = DataLoader(dataset, batch_size=32, shuffle=True)

    model = SpendingLSTM(input_size=1, hidden_size=64, num_layers=2)
    model.train()

    optimizer = optim.Adam(model.parameters(), lr=0.001)
    loss_fn = nn.MSELoss()

    for epoch in range(50):

        for batch_X, batch_y in loader:

            pred = model(batch_X)

            loss = loss_fn(pred.squeeze(), batch_y)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        print("Epoch:", epoch, "Loss:", loss.item())

    # Evaluate model
    model.eval()

    with torch.no_grad():

        test_pred = model(X_test)

        test_loss = loss_fn(test_pred.squeeze(), y_test)

    print("Test Loss:", test_loss.item())

    # Save artifacts
    torch.save(model.state_dict(), "multivariate_lstm_model.pth")
    joblib.dump(scaler, "feature_scaler.pkl")

    print("Model and scaler saved successfully!")

    return model


if __name__ == "__main__":
    train()