import torch
import torch.optim as optim
import torch.nn as nn
import joblib

from sklearn.preprocessing import MinMaxScaler
from kaggle_loader import load_kaggle_dataset
from kaggle_preprocess import preprocess_kaggle_data
from sequence_builder import create_sequences
from lstm_model import SpendingLSTM

# Load and preprocess Kaggle dataset
df = load_kaggle_dataset()
df = preprocess_kaggle_data(df)


def train():

    global df

    if df is None or len(df) < 10:
        print("Not enough data to train the model")
        return

    # Normalize the data
    scaler = MinMaxScaler()
    data = df['Amount'].values.reshape(-1, 1)
    data_scaled = scaler.fit_transform(data)

    X, y = create_sequences(data_scaled.flatten())

    X = torch.tensor(X).float().unsqueeze(-1)
    y = torch.tensor(y).float()

    model = SpendingLSTM()

    optimizer = optim.Adam(model.parameters(), lr=0.001)
    loss_fn = nn.MSELoss()

    for epoch in range(50):

        pred = model(X)

        loss = loss_fn(pred.squeeze(), y)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        print("Epoch:", epoch, "Loss:", loss.item())

    # Save trained model and scaler
    torch.save(model.state_dict(), "spending_lstm_model.pth")
    joblib.dump(scaler, "scaler.save")

    print("Model and scaler saved successfully!")

    return model


# Run training when script executes
if __name__ == "__main__":
    train()