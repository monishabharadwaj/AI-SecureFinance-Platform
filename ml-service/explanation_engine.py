def generate_explanation(result):

    explanations = []

    predicted = result["predicted_spending"]
    actual = result["actual_spending"]
    residual = result["residual"]

    # Spending deviation explanation
    if residual > predicted * 2:
        explanations.append(
            f"This transaction is significantly higher than your usual spending. "
            f"You typically spend around ₹{predicted:.2f}, but this transaction was ₹{actual:.2f}."
        )

    # Pattern deviation explanation
    if result["autoencoder_score"] > 0.9:
        explanations.append(
            "This expense doesn't match your usual spending pattern based on your past transactions."
        )

    # Behaviour deviation explanation
    if result["isolation_score"] > 0.9:
        explanations.append(
            "This transaction stands out compared to your recent spending behaviour."
        )

    if result["risk_level"] == "HIGH":
        explanations.append(
            "This doesn't necessarily mean anything is wrong, but it is unusual compared to your typical expenses."
        )

    return explanations