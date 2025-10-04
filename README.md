# ExoAI Backend 🚀

**Project:** ExoAI: AI Exoplanet Classification  
**Team:** Marc Nebot, Miquel Cortijo, Sheyla Castro, Víctor-Xavier Bigorra, Daniel Muñoz  

---

## 🧠 Overview

This is the backend service for **ExoAI**, an AI-powered system designed to automatically classify exoplanets using open-source NASA datasets (Kepler, K2, TESS).  
The backend is built with **FastAPI** and serves endpoints for inference and model management.

The project structure includes:
- `/backend` → FastAPI app (this folder)
- `/frontend` → Next.js web interface (built separately)

---

## ⚙️ Tech Stack

- **FastAPI** for the web server  
- **Uvicorn** as ASGI server  
- **scikit-learn** for ML model training and inference  
- **Joblib** for model persistence  
- **NumPy** and **Pandas** for data processing  

---

## 🧩 Project Structure

```
backend/
│
├── app/
│   ├── main.py                 # FastAPI entry point
│   ├── routes/                 # API endpoints
│   ├── models/                 # Model loading & inference logic
│   ├── schemas/                # Pydantic models for validation
│   └── utils/                  # Optional helpers (preprocessing, etc.)
│
├── models/
│   └── exoplanet_model.pkl     # Trained ML model (placeholder)
│
├── requirements.txt
└── run.sh
```

---

## 🧠 Model Training

When you receive the dataset (e.g., Kepler or TESS data), you can train a simple Random Forest model using scikit-learn.

Example training script (`train_model.py`):

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

df = pd.read_csv("data/exoplanet_data.csv")
features = ["orbital_period", "transit_duration", "planet_radius", "stellar_radius", "stellar_temp"]
X = df[features]
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

joblib.dump(model, "models/exoplanet_model.pkl")
print("✅ Model saved to models/exoplanet_model.pkl")
```

---

## 🚀 Run Locally

### 1️⃣ Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2️⃣ Install dependencies
```bash
pip install -r requirements.txt
```

### 3️⃣ Start FastAPI server
```bash
bash run.sh
```
Or manually:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🧪 API Endpoints

### **GET** `/`
> Health check endpoint. Returns API welcome message.

### **GET** `/exoplanet/health`
> Verifies backend status.

### **POST** `/exoplanet/predict`
> Run inference using the trained model.  
> Request body example:

```json
{
  "orbital_period": 365.2,
  "transit_duration": 2.3,
  "planet_radius": 1.1,
  "stellar_radius": 0.9,
  "stellar_temp": 5800
}
```

Response example:
```json
{
  "prediction": "confirmed",
  "probability": [0.8, 0.15, 0.05]
}
```

---

## 🌌 Notes
- The backend is fully compatible with **Next.js** frontend (via CORS).  
- Make sure `models/exoplanet_model.pkl` exists before starting the server.  
- You can replace or retrain the model easily by updating the `.pkl` file.

---

**ExoAI Backend** — built during a 48h Hackathon 🪐  
“Exploring the universe, one exoplanet at a time.”
