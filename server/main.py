from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd  # <--- Agregado para armar el DataFrame estructurado
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
    print(f"✅ Modelo cargado correctamente")
    
    if os.path.exists(SCALER_PATH):
        scaler = joblib.load(SCALER_PATH)
        print(f"✅ Escalador cargado correctamente")
    else:
        print(f"⚠️ Alerta: No se encontró el archivo del escalador en {SCALER_PATH}.")

except Exception as e:
    model_load_error = str(e)
    print(f"❌ Error al inicializar los componentes: {e}")


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
        # 1. Definimos el orden estricto de columnas que el escalador aprendió en la notebook
        columns_order = [
            "Age", "RestingBP", "Cholesterol", "FastingBS", "MaxHR", "Oldpeak", "Sex_M",
            "ChestPainType_ATA", "ChestPainType_NAP", "ChestPainType_TA",
            "RestingECG_Normal", "RestingECG_ST", "ExerciseAngina_Y", "ST_Slope_Flat", "ST_Slope_Up"
        ]

        # 2. Mapeamos los datos entrantes a un diccionario estructurado
        raw_data_dict = {
            "Age": [data.Age],
            "RestingBP": [data.RestingBP],
            "Cholesterol": [data.Cholesterol],
            "FastingBS": [data.FastingBS],
            "MaxHR": [data.MaxHR],
            "Oldpeak": [data.Oldpeak],
            "Sex_M": [data.Sex_M],
            "ChestPainType_ATA": [data.ChestPainType_ATA],
            "ChestPainType_NAP": [data.ChestPainType_NAP],
            "ChestPainType_TA": [data.ChestPainType_TA],
            "RestingECG_Normal": [data.RestingECG_Normal],
            "RestingECG_ST": [data.RestingECG_ST],
            "ExerciseAngina_Y": [data.ExerciseAngina_Y],
            "ST_Slope_Flat": [data.ST_Slope_Flat],
            "ST_Slope_Up": [data.ST_Slope_Up]
        }
        
        # 3. Construimos el DataFrame con las columnas identificadas (Adiós UserWarning 👋)
        df_features = pd.DataFrame(raw_data_dict, columns=columns_order)

        # 4. Escalar las características de forma prolija
        if scaler is not None:
            scaled_features = scaler.transform(df_features)
        else:
            scaled_features = df_features.to_numpy()

        # 5. Realizar la predicción numérica y probabilística
        raw_prediction = model.predict(scaled_features)[0]
        raw_probability = model.predict_proba(scaled_features)[0][1]
        
        # 6. Forzamos el casteo a tipos primitivos nativos de Python (Adiós Error 500 🚀)
        prediction = int(raw_prediction)
        probability = float(raw_probability)
        
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