from predictor import predict_next

# Example univariate sequence with spending amounts
# This shows a trend: amounts increasing by ~10 each step
data = [
    [100.0],
    [110.5],
    [121.0],
    [131.5],
    [142.0],
    [152.5],
    [163.0],
    [173.5],
    [184.0],
    [194.5]
]

result = predict_next(data)

print("Predicted next spending:", result)