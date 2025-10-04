from pydantic import BaseModel
from typing import Optional

class ExoplanetFeatures(BaseModel):
    orbital_period: float
    transit_duration: float
    planet_radius: float
    stellar_radius: float
    stellar_temp: float
    # hay que añadir más cosas eh

class ExoplanetPrediction(BaseModel):
    prediction: str
    probability: Optional[list] = None
