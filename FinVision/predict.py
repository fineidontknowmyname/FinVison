from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from prophet import Prophet
from typing import List, Optional
import os
import requests
import json

# --- Environment Variables ---
GOOGLE_GEMINI_API_KEY = os.environ.get("GOOGLE_GEMINI_API_KEY")

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Currency Utility ---
def get_currency_symbol(currency_code: str) -> str:
    symbols = {
        "INR": "₹",
        "USD": "$",
        "EUR": "€",
    }
    return symbols.get(currency_code.upper(), "$")  # Default to USD symbol

# --- Data Models ---
class ExpenseItem(BaseModel):
    category: str
    amount: float

class MonthlySpend(BaseModel):
    monthly_spend: List[float]
    categorized_expenses: List[ExpenseItem]
    income: Optional[float] = None
    currency: str = "USD"

class UserProfile(BaseModel):
    income: float
    expenses: List[ExpenseItem]
    goals: List[str]
    currency: str = "USD"

# --- Google Gemini API Call ---
def call_google_gemini(prompt: str):
    if not GOOGLE_GEMINI_API_KEY:
        raise ValueError("GOOGLE_GEMINI_API_KEY environment variable is not set.")

    headers = {
        "Authorization": f"Bearer {GOOGLE_GEMINI_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "prompt": prompt,
        "max_output_tokens": 300
    }

    response = requests.post("https://gemini.googleapis.com/v1/generate", headers=headers, json=payload, timeout=60)
    response.raise_for_status()
    
    result = response.json()
    # Adjust key based on actual Gemini response structure
    return result.get('output_text', '')

# --- Personalized Recommendations ---
def get_personalized_recommendations(profile: UserProfile):
    currency_symbol = get_currency_symbol(profile.currency)
    expense_details = ", ".join([f'{e.category} ({currency_symbol}{e.amount:.2f})' for e in profile.expenses])
    goals_details = ", ".join(profile.goals)
    
    prompt = f"""
You are a friendly financial advisor. Provide concise, actionable financial recommendations 
based on the user's currency. Return a JSON array of 3-5 recommendation strings. 
Do not add any extra text.

User Profile:
- Monthly Income: {currency_symbol}{profile.income:,.2f}
- Monthly Expenses: {expense_details}
- Financial Goals: {goals_details}
"""

    try:
        response_text = call_google_gemini(prompt)
        json_start = response_text.find('[')
        json_end = response_text.rfind(']') + 1
        if json_start == -1 or json_end == 0:
            raise ValueError("No JSON array found in the response")
        json_str = response_text[json_start:json_end]
        recommendations = json.loads(json_str)
        return {"recommendations": recommendations}
    except Exception as e:
        print(f"Failed to get recommendations from Google Gemini: {e}")
        return {"error": "AI service is unavailable or returned an invalid response."}

# --- API Endpoints ---
@app.post("/predict")
def predict_spend(data: MonthlySpend):
    df = pd.DataFrame({
        'ds': pd.to_datetime(pd.date_range(start='2023-01-01', periods=len(data.monthly_spend), freq='M')),
        'y': data.monthly_spend
    })

    model = Prophet()
    model.fit(df)

    future = model.make_future_dataframe(periods=1, freq='M')
    forecast = model.predict(future)
    predicted_spend = forecast['yhat'].iloc[-1]

    potential_savings = 0
    if data.income:
        potential_savings = data.income - predicted_spend

    return {
        "predicted_spend": predicted_spend, 
        "potential_savings": potential_savings,
        "currency_code": data.currency,
        "currency_symbol": get_currency_symbol(data.currency)
    }

@app.post("/personalized_recommendations")
def personalized_recommendations_endpoint(profile: UserProfile):
    return get_personalized_recommendations(profile)
