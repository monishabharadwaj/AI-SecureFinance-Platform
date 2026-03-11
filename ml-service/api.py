from fastapi import FastAPI
from pydantic import BaseModel

from ai_orchestrator import FinancialAIOrchestrator

app = FastAPI()

# Initialize AI orchestrator
ai_orchestrator = FinancialAIOrchestrator()


# -----------------------------
# Request Models
# -----------------------------

class PredictionRequest(BaseModel):
    sequence: list


class TransactionRequest(BaseModel):
    transaction_amount: float
    sequence: list


class InsightsRequest(BaseModel):
    transactions: list


class ChatRequest(BaseModel):
    question: str
    transactions: list


class BudgetRequest(BaseModel):
    transactions: list
    budgets: dict


# -----------------------------
# Root
# -----------------------------

@app.get("/")
def home():
    return {"message": "AI Secure Finance ML Service Running"}


# -----------------------------
# Spending Prediction
# -----------------------------

@app.post("/predict_spending")
def predict_spending(data: PredictionRequest):

    return ai_orchestrator.predict_future_spending(
        data.sequence
    )


# -----------------------------
# Unusual Spending Analysis
# -----------------------------

@app.post("/analyze_transaction")
def analyze_transaction(data: TransactionRequest):

    result = ai_orchestrator.analyze_transaction(
        data.transaction_amount,
        data.sequence
    )

    return result


# -----------------------------
# Financial Insights Report
# -----------------------------

@app.post("/financial_report")
def financial_report(data: InsightsRequest):

    result = ai_orchestrator.generate_complete_financial_analysis(
        data.transactions
    )

    return result


# -----------------------------
# AI Financial Chatbot
# -----------------------------

@app.post("/financial_chat")
def financial_chat(data: ChatRequest):

    response = ai_orchestrator.financial_chat(
        data.question,
        data.transactions
    )

    return response


# -----------------------------
# Budget Awareness
# -----------------------------

@app.post("/budget_analysis")
def budget_analysis(data: BudgetRequest):

    result = ai_orchestrator.analyze_budget(
        data.transactions,
        data.budgets
    )

    return {"budget_insights": result}