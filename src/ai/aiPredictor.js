const ML_SERVICE_URL = "http://127.0.0.1:8000";

async function analyzeTransaction(transactionAmount, sequence) {

    const response = await fetch(`${ML_SERVICE_URL}/analyze_transaction`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            transaction_amount: transactionAmount,
            sequence: sequence
        })
    });

    const data = await response.json();

    return data;
}

module.exports = { analyzeTransaction };