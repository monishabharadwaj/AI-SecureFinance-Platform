const axios = require('axios');

const ML_SERVICE_URL = "http://127.0.0.1:8000";

async function analyzeTransaction(transactionAmount, sequence) {
    try {
        const response = await axios.post(`${ML_SERVICE_URL}/analyze_transaction`, {
            transaction_amount: transactionAmount,
            sequence: sequence
        });

        return response.data;
    } catch (error) {
        console.error("Analyze Transaction Error:", error.response?.data || error.message);
        throw error;
    }
}

async function predictSpending(sequence) {
    try {
        const response = await axios.post(`${ML_SERVICE_URL}/predict_spending`, {
            sequence: sequence
        });

        return response.data.predicted_next_spending;
    } catch (error) {
        console.error("Predict Spending Error:", error.response?.data || error.message);
        throw error;
    }
}

module.exports = { analyzeTransaction, predictSpending };
