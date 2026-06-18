from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI(
    title="Heart Disease Prediction API",
    description="API para predecir enfermedades cardíacas usando regresión logística balanceada.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas de los archivos binarios
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model", "logistic_model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "..", "model", "scaler.pkl")

model = None
scaler = None
model_load_error = None

# --- Carga del Modelo y del Escalador ---
try:
    model = joblib.load(MODEL_PATH)
    print("Modelo cargado correctamente")
    
    if os.path.exists(SCALER_PATH):
        scaler = joblib.load(SCALER_PATH)
        print("Escalador cargado correctamente")
    else:
        print(f"Alerta: No se encontró el archivo del escalador en {SCALER_PATH}.")

except Exception as e:
    model_load_error = str(e)
    print(f"Error al inicializar los componentes: {e}")


# Pydantic model adecuado a las 15 columnas que espera el backend
class PredictionInput(BaseModel):
    Age: int
    RestingBP: int
    Cholesterol: int
    FastingBS: int
    MaxHR: int
    Oldpeak: float
    Sex_M: int
    ChestPainType_ATA: int
    ChestPainType_NAP: int
    ChestPainType_TA: int
    RestingECG_Normal: int
    RestingECG_ST: int
    ExerciseAngina_Y: int
    ST_Slope_Flat: int
    ST_Slope_Up: int


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
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None,
        "model_path": MODEL_PATH,
        "scaler_path": SCALER_PATH,
        "path_exists": os.path.exists(MODEL_PATH),
        "load_error": model_load_error,
    }


@app.post("/predict", response_model=PredictionOutput)
def predict(data: PredictionInput):
    if model is None:
        raise HTTPException(status_code=503, detail="Modelo no disponible.")

    try:
        # Construir la matriz respetando estrictamente las 15 columnas del escalador
        raw_features = np.array([[
            data.Age,
            data.RestingBP,
            data.Cholesterol,
            data.FastingBS,
            data.MaxHR,
            data.Oldpeak,
            data.Sex_M,
            data.ChestPainType_ATA,
            data.ChestPainType_NAP,
            data.ChestPainType_TA,
            data.RestingECG_Normal,
            data.RestingECG_ST,
            data.ExerciseAngina_Y,
            data.ST_Slope_Flat,
            data.ST_Slope_Up,
        ]])

        # Escalar los datos usando las 15 columnas correctas
        if scaler is not None:
            scaled_features = scaler.transform(raw_features)
        else:
            scaled_features = raw_features

        # Realizar la predicción
        prediction = int(model.predict(scaled_features)[0])
        probability = float(model.predict_proba(scaled_features)[0][1])
        label = "Enfermedad cardíaca detectada" if prediction == 1 else "Sin enfermedad cardíaca"

        return PredictionOutput(
            prediction=prediction,
            probability=round(probability, 4),
            label=label
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar la predicción: {str(e)}"
        )