import joblib
import numpy as np
import pandas as pd

class ExoplanetModel:
    def __init__(self, model_path: str = "models/exoplanet_model.pkl"):
        try:
            self.model = joblib.load(model_path)
        except Exception as e:
            print(f"[WARN] Modelo no cargado: {e}")
            self.model = None

    def predict_csv(self, df: pd.DataFrame):
        if not self.model:
            raise ValueError("Modelo no cargado correctamente.")
        
        if "target" in df.columns:
            df = df.drop(columns=["target"])
        
        preds = self.model.predict(df)
        probas = getattr(self.model, "predict_proba", lambda _: None)(df)

        results = []
        for i, row in enumerate(df.index):
            row_data = {
                "id": str(row),
                "prediction": str(preds[i]),
                "probability": probas[i].tolist() if probas is not None else None,
                "confidence": float(np.max(probas[i]) * 100) if probas is not None else None
            }
            results.append(row_data)
        
        summary = {
            "total": len(results),
            "confirmed": int(np.sum(np.array(preds) == "confirmed")),
            "candidate": int(np.sum(np.array(preds) == "candidate")),
            "false_positive": int(np.sum(np.array(preds) == "false positive")),
            "high_confidence": int(np.sum([r["confidence"] and r["confidence"] > 60 for r in results])),
        }
        
        return {"summary": summary, "results": results}
