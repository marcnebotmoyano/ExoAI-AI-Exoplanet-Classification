from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
from app.models.model_handler import ExoplanetModel
from app.data.data import KEPLER_EXPECTED_COLUMNS, KEPLER_STRING_COLUMNS, KEPLER_NUMERIC_COLUMNS, K2_EXPECTED_COLUMNS, K2_STRING_COLUMNS, K2_NUMERIC_COLUMNS

router = APIRouter(prefix="/exoplanet", tags=["Exoplanet AI"])
model = ExoplanetModel()
model2 = ExoplanetModel()



@router.post("/predict")
async def predict_exoplanets(file: UploadFile = File(...), model: str = "..."):
    try:
        df = pd.read_csv(file.file)

        if model == "kepler":
            expected = KEPLER_EXPECTED_COLUMNS[:-1]
            string_cols = [col for col in KEPLER_STRING_COLUMNS if col in expected]
            numeric_cols = [col for col in KEPLER_NUMERIC_COLUMNS if col in expected]
            missing_cols = [col for col in expected if col not in df.columns]
            extra_cols = [col for col in df.columns if col not in expected]
            if missing_cols:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing required columns: {', '.join(missing_cols)}"
                )
            if extra_cols:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unexpected extra columns: {', '.join(extra_cols)}"
                )
            if df.isnull().any().any():
                raise HTTPException(
                    status_code=400,
                    detail="CSV contains missing (NaN) values. Please clean the data."
                )
            for col in string_cols:
                if not pd.api.types.is_string_dtype(df[col]):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Column '{col}' must contain string/text values."
                    )
            for col in numeric_cols:
                if not pd.api.types.is_numeric_dtype(df[col]):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Column '{col}' must contain only numeric values (int/float)."
                    )
        elif model == "k2":
            expected = K2_EXPECTED_COLUMNS[:-1]
            string_cols = [col for col in K2_STRING_COLUMNS if col in expected]
            numeric_cols = [col for col in K2_NUMERIC_COLUMNS if col in expected]
            missing_cols = [col for col in expected if col not in df.columns]
            extra_cols = [col for col in df.columns if col not in expected]
            if missing_cols:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing required columns: {', '.join(missing_cols)}"
                )
            if extra_cols:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unexpected extra columns: {', '.join(extra_cols)}"
                )
            if df.isnull().any().any():
                raise HTTPException(
                    status_code=400,
                    detail="CSV contains missing (NaN) values. Please clean the data."
                )
            for col in string_cols:
                if not pd.api.types.is_string_dtype(df[col]):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Column '{col}' must contain string/text values."
                    )
            for col in numeric_cols:
                if not pd.api.types.is_numeric_dtype(df[col]):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Column '{col}' must contain only numeric values (int/float)."
                    )
        #crear atributo predict_csv antes de descomentar
        #result = model.predict_csv(df)
        #return result
        return "valido"

    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="Uploaded CSV is empty or invalid format.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")



@router.post("/ingest")
async def ingest_exoplanets(file: UploadFile = File(...), model: str = "..."):
    try:
        df = pd.read_csv(file.file)

        if model == "kepler":
            missing_cols = [col for col in KEPLER_EXPECTED_COLUMNS if col not in df.columns]
            extra_cols = [col for col in df.columns if col not in KEPLER_EXPECTED_COLUMNS]
            if missing_cols:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing required columns: {', '.join(missing_cols)}"
                )
            if extra_cols:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unexpected extra columns: {', '.join(extra_cols)}"
                )
            if df.isnull().any().any():
                raise HTTPException(
                    status_code=400,
                    detail="CSV contains missing (NaN) values. Please clean the data."
                )
            for col in KEPLER_STRING_COLUMNS:
                if not pd.api.types.is_string_dtype(df[col]):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Column '{col}' must contain string/text values."
                    )
            for col in KEPLER_NUMERIC_COLUMNS:
                if not pd.api.types.is_numeric_dtype(df[col]):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Column '{col}' must contain only numeric values (int/float)."
                    )
        elif model == "k2":
            missing_cols = [col for col in K2_EXPECTED_COLUMNS if col not in df.columns]
            extra_cols = [col for col in df.columns if col not in K2_EXPECTED_COLUMNS]
            if missing_cols:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing required columns: {', '.join(missing_cols)}"
                )
            if extra_cols:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unexpected extra columns: {', '.join(extra_cols)}"
                )
            if df.isnull().any().any():
                raise HTTPException(
                    status_code=400,
                    detail="CSV contains missing (NaN) values. Please clean the data."
                )
            for col in K2_STRING_COLUMNS:
                if not pd.api.types.is_string_dtype(df[col]):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Column '{col}' must contain string/text values."
                    )
            for col in K2_NUMERIC_COLUMNS:
                if not pd.api.types.is_numeric_dtype(df[col]):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Column '{col}' must contain only numeric values (int/float)."
                    )

        #cambiar por funcion de ingest
        #crear atributo predict_csv antes de descomentar
        #result = model.predict_csv(df)
        #return result
        return "valido"

    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="Uploaded CSV is empty or invalid format.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")