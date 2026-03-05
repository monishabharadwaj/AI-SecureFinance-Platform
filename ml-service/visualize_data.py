import matplotlib.pyplot as plt
from data_generator import generate_spending_data

df = generate_spending_data()

plt.plot(df["date"], df["amount"])
plt.title("Synthetic Spending Pattern")
plt.show()
