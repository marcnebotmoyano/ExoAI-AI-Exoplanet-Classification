import joblib
import numpy as np
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class ExoplanetModel:
    def __init__(self, model_path: str, scaler_path: str = None):
        model_full = os.path.join(BASE_DIR, model_path)
        scaler_full = os.path.join(BASE_DIR, scaler_path) if scaler_path else None
        try:
            self.model = joblib.load(model_full)
            self.scaler = joblib.load(scaler_full) if scaler_full else None
            print(f"[OK] Modelo cargado: {model_full}")
        except Exception as e:
            print(f"[WARN] Modelo no cargado: {e}")
            self.model = None
            self.scaler = None

    def predict_csv(self, df: pd.DataFrame, id_col: str = None):
        if not self.model:
            raise ValueError("Modelo no cargado correctamente.")

        df_copy = df.copy()

        if not id_col:
            if "kepid" in df_copy.columns:
                id_col = "kepid"
            elif "pl_name" in df_copy.columns:
                id_col = "pl_name"
            else:
                id_col = None

        if id_col:
            df_copy[id_col] = df_copy[id_col].astype(str)

        ids = df_copy[id_col] if id_col else df_copy.index.astype(str)

        X = df_copy.drop(columns=["target"], errors='ignore')
        if id_col in X.columns:
            X = X.drop(columns=[id_col])

        if self.scaler:
            X[X.columns] = self.scaler.transform(X)

        preds = self.model.predict(X)
        probas = getattr(self.model, "predict_proba", lambda _: None)(X)

        label_map = {0: "candidate", 1: "confirmed", 2: "false positive"}
        mapped_preds = [label_map.get(int(p), str(p)) for p in preds]

        results = []
        for i, idx in enumerate(ids):
            row_data = {
                "id": str(idx),
                "prediction": mapped_preds[i],
                "probability": probas[i].tolist() if probas is not None else None,
                "confidence": float(np.max(probas[i]) * 100) if probas is not None else None
            }
            results.append(row_data)

        feature_importances = {}
        if hasattr(self.model, "named_estimators_"):
            for est_name, est in self.model.named_estimators_.items():
                if hasattr(est, "feature_importances_"):
                    for col, imp in zip(X.columns, est.feature_importances_):
                        feature_importances[col] = feature_importances.get(col, 0) + imp

            total = sum(feature_importances.values())
            if total > 0:
                feature_importances = {k: v / total for k, v in feature_importances.items()}

            feature_importances = dict(
                sorted(feature_importances.items(), key=lambda x: x[1], reverse=True)[:5]
            )
        else:
            feature_importances = None

        summary = {
            "total": len(results),
            "confirmed": mapped_preds.count("confirmed"),
            "candidate": mapped_preds.count("candidate"),
            "false_positive": mapped_preds.count("false positive"),
            "high_confidence": sum(1 for r in results if r["confidence"] and r["confidence"] > 60),
            "column_importance": feature_importances
        }

        return {"summary": summary, "results": results}
