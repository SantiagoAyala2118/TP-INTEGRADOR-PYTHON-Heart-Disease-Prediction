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
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model", "logistic_model.pkl")

# --- Carga del modelo con diagnóstico completo ---
model = None
model_load_error = None

try:
    model = joblib.load(MODEL_PATH)
    print(f"✅ Modelo cargado correctamente")
    print(f"   Tipo: {type(model)}")

    # Test con datos dummy para verificar que funciona
    test_input = np.array([[45, 1, 2, 130, 250, 0, 1, 150, 0, 1.5, 1]])
    test_pred = model.predict(test_input)
    test_prob = model.predict_proba(test_input)
    print(f"✅ Test de predicción OK → pred={test_pred[0]}, prob={test_prob[0][1]:.4f}")

except FileNotFoundError:
    model_load_error = f"Archivo no encontrado: {MODEL_PATH}"
    print(f"❌ {model_load_error}")

except Exception as e:
    model_load_error = str(e)
    print(f"❌ Error al cargar el modelo: {e}")


class PredictionInput(BaseModel):
    Age: int
    RestingBP: int
    Cholesterol: int
    FastingBS: int
    MaxHR: int
    Oldpeak: float
    RestingBPMedido: int
    Sex_M: int
    ChestPainType_NAP: int
    ChestPainType_TA: int
    ChestPainType_ATA: int
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
        "model_type": str(type(model)) if model else None,
        "model_path": MODEL_PATH,
        "path_exists": os.path.exists(MODEL_PATH),
        "load_error": model_load_error,
    }


@app.get("/debug")
def debug():
    """Endpoint de diagnóstico: prueba el modelo con datos dummy."""
    if model is None:
        return {
            "model_loaded": False,
            "load_error": model_load_error,
            "model_path": MODEL_PATH,
            "path_exists": os.path.exists(MODEL_PATH),
        }

    try:
        test_input = np.array([[45, 1, 2, 130, 250, 0, 1, 150, 0, 1.5, 1]])
        prediction = int(model.predict(test_input)[0])
        probability = float(model.predict_proba(test_input)[0][1])
        return {
            "model_loaded": True,
            "model_type": str(type(model)),
            "test_prediction": prediction,
            "test_probability": round(probability, 4),
            "status": "✅ Todo OK",
        }
    except Exception as e:
        return {
            "model_loaded": True,
            "model_type": str(type(model)),
            "error": str(e),
            "status": "❌ El modelo carga pero falla al predecir",
        }


@app.post("/predict", response_model=PredictionOutput)
def predict(data: PredictionInput):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail=f"Modelo no disponible. Error: {model_load_error}"
        )

    try:
        # Construir el array en el mismo orden que el modelo espera
        features = np.array([[
            data.Age,
            data.RestingBP,
            data.Cholesterol,
            data.FastingBS,
            data.MaxHR,
            data.Oldpeak,
            data.RestingBPMedido,
            data.Sex_M,
            data.ChestPainType_NAP,
            data.ChestPainType_TA,
            data.ChestPainType_ATA,
            data.RestingECG_Normal,
            data.RestingECG_ST,
            data.ExerciseAngina_Y,
            data.ST_Slope_Flat,
            data.ST_Slope_Up,
        ]])

        prediction = int(model.predict(features)[0])
        probability = float(model.predict_proba(features)[0][1])
        label = "Enfermedad cardíaca detectada" if prediction == 1 else "Sin enfermedad cardíaca"

        return PredictionOutput(
            prediction=prediction,
            probability=round(probability, 4),
            label=label
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al predecir: {str(e)}"
        )