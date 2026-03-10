import matplotlib.pyplot as plt
from data_generator import generate_spending_data

df = generate_spending_data()

plt.plot(df["date"], df["amount"])
plt.title("Synthetic Spending Pattern")
plt.show()

# --- Step 4: Explore Dataset (VERY IMPORTANT) ---
from kaggle_loader import load_dataset

# load and inspect raw dataset
raw_df = load_dataset()
print(raw_df.head())

print("\nShape:")
print(raw_df.shape)

print("\nColumns:")
print(raw_df.columns)

print("\nStatistics:")
print(raw_df.describe())

print("\nFraud count:")
print(raw_df["Class"].value_counts())
