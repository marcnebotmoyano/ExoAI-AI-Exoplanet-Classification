import joblib
import numpy as np

class ExoplanetModel:
    def __init__(self, model_path: str = "models/exoplanet_model.pkl"):
        try:
            self.model = joblib.load(model_path)
        except Exception as e:
            print(f"[WARN] Modelo no cargado: {e}")
            self.model = None

    def predict(self, features: dict):
        if not self.model:
            raise ValueError("Modelo no cargado correctamente.")

        x = np.array([list(features.values())]).astype(float)
        prediction = self.model.predict(x)[0]
        proba = getattr(self.model, "predict_proba", lambda _: [[None]])(x)[0]
        return {"prediction": str(prediction), "probability": proba}
