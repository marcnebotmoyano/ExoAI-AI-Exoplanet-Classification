from fastapi import APIRouter, HTTPException
from app.schemas.exoplanet import ExoplanetFeatures, ExoplanetPrediction
from app.models.model_handler import ExoplanetModel

router = APIRouter(prefix="/exoplanet", tags=["Exoplanet AI"])

model = ExoplanetModel()

@router.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend running smoothly 🚀"}

@router.post("/predict", response_model=ExoplanetPrediction)
def predict_exoplanet(data: ExoplanetFeatures):
    try:
        result = model.predict(data.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
