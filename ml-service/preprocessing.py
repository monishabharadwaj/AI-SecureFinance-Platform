import pandas as pd
from data_generator import generate_spending_data
from data_loader import load_transactions


def create_training_dataset(user_id):

    real_data = load_transactions(user_id)

    synthetic = generate_spending_data(365)

    combined = pd.concat([synthetic, real_data])

    combined = combined.sort_values("date")

    return combined
