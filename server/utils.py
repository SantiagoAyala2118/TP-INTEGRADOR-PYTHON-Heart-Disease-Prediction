import numpy as np


def build_features(data: dict) -> np.ndarray:
    keys = [
        "Age", "Sex", "ChestPainType", "RestingBP",
        "Cholesterol", "FastingBS", "RestingECG", "MaxHR",
        "ExerciseAngina", "Oldpeak", "ST_Slope"
    ]
    return np.array([[data[k] for k in keys]])


def format_prediction(prediction: int, probability: float) -> dict:
    return {
        "prediction": prediction,
        "probability": round(probability, 4),
        "label": "Enfermedad cardíaca detectada" if prediction == 1 else "Sin enfermedad cardíaca"
    }