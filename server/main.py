from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI(
    title="Heart Disease Prediction API",
    description="API para predecir enfermedades cardíacas usando regresión logística.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "modelo_regresion_logistica.pkl")

try:
    model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    model = None
    print(f"⚠️  Modelo no encontrado en: {MODEL_PATH}")


class PredictionInput(BaseModel):
    Age: int              # Edad del paciente
    Sex: int              # 0 = femenino, 1 = masculino
    ChestPainType: int    # 0-3
    RestingBP: int        # Presión arterial en reposo
    Cholesterol: int      # Colesterol sérico
    FastingBS: int        # Azúcar en sangre en ayunas > 120 mg/dl (0 o 1)
    RestingECG: int       # Resultados electrocardiográficos en reposo (0-2)
    MaxHR: int            # Frecuencia cardíaca máxima
    ExerciseAngina: int   # Angina inducida por ejercicio (0 o 1)
    Oldpeak: float        # Depresión del segmento ST
    ST_Slope: int         # Pendiente del segmento ST (0-2)


class PredictionOutput(BaseModel):
    prediction: int
    probability: float
    label: str


@app.get("/")
def root():
    return {"message": "Heart Disease Prediction API funcionando ✅"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None
    }


@app.post("/predict", response_model=PredictionOutput)
def predict(data: PredictionInput):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="El modelo no está disponible. Asegurate de que el archivo .pkl esté en models/."
        )

    features = np.array([[
        data.Age, data.Sex, data.ChestPainType, data.RestingBP,
        data.Cholesterol, data.FastingBS, data.RestingECG, data.MaxHR,
        data.ExerciseAngina, data.Oldpeak, data.ST_Slope
    ]])

    prediction = int(model.predict(features)[0])
    probability = float(model.predict_proba(features)[0][1])
    label = "Enfermedad cardíaca detectada" if prediction == 1 else "Sin enfermedad cardíaca"

    return PredictionOutput(
        prediction=prediction,
        probability=round(probability, 4),
        label=label
    )