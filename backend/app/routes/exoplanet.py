from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
from app.models.model_handler import ExoplanetModel

router = APIRouter(prefix="/exoplanet", tags=["Exoplanet AI"])
model = ExoplanetModel()

@router.post("/predict")
async def predict_exoplanets(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(file.file)

        result = model.predict_csv(df)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")
