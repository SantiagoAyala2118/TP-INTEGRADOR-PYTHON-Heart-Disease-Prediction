# Análisis Clínico y Clasificación de Enfermedades Cardíacas

Trabajo Práctico Final — Taller de Lenguajes de Programación III: Python para Ciencia de Datos
Instituto Politécnico Formosa
Profesores: Gabriel Acosta — Flavian Dante Benitez

---

## Integrantes

- Ayala, Santiago Tomás
- Zagaña, Torancio Alfonzo
- Zigaran, Lucas Natanael

---

## Descripción

El proyecto abarca el ciclo de vida completo de una solución de Machine Learning aplicada al dominio clínico: desde el análisis exploratorio del dataset `heart_disease_dataset.csv` (918 registros, 12 variables) hasta el despliegue de una API que sirve las predicciones en tiempo real a una interfaz web desarrollada en React.

El modelo clasifica pacientes en dos categorías: **sin enfermedad cardíaca** o **con enfermedad cardíaca detectada**, a partir de variables como edad, presión arterial en reposo, colesterol, frecuencia cardíaca máxima y tipo de dolor de pecho, entre otras.

---

## Stack Tecnológico

| Capa                      | Tecnología                                                      |
| ------------------------- | ---------------------------------------------------------------- |
| Análisis y modelado      | Python 3, Jupyter Notebook                                       |
| Manipulación de datos    | pandas, NumPy                                                    |
| Visualización            | Matplotlib, Seaborn                                              |
| Machine Learning          | scikit-learn (Logistic Regression, Decision Tree, Random Forest) |
| Serialización del modelo | joblib                                                           |
| Backend / API             | FastAPI, Uvicorn                                                 |
| Frontend                  | React, Vite                                                      |

---

## Instalación y Uso

### Backend (FastAPI)

**1. Crear y activar un entorno virtual**

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

**2. Instalar dependencias de Python**

```bash
pip install -r requirements.txt
```

**3. Ejecutar el servidor**

Desde la raíz del proyecto:

```bash
uvicorn server.main:app --reload
```

La API quedará disponible en `http://127.0.0.1:8000`.

---

### Frontend (React + Vite)

**1. Instalar dependencias**

```bash
cd client
npm install
```

**2. Ejecutar la aplicación**

```bash
npm run dev
```

La interfaz quedará disponible en `http://localhost:5173`.

---

## Endpoints de la API

| Método  | Ruta         | Descripción                                                      |
| -------- | ------------ | ----------------------------------------------------------------- |
| `GET`  | `/`        | Verificación de estado del servidor                              |
| `GET`  | `/health`  | Diagnóstico detallado: estado del modelo y el escalador          |
| `POST` | `/predict` | Recibe los datos clínicos del paciente y devuelve la predicción |

### Ejemplo de request a `/predict`

El endpoint espera un objeto JSON con las 15 columnas resultantes del preprocesamiento aplicado en el notebook:

```json
{
  "Age": 54,
  "RestingBP": 130,
  "Cholesterol": 237,
  "FastingBS": 0,
  "MaxHR": 150,
  "Oldpeak": 1.5,
  "Sex_M": 1,
  "ChestPainType_ATA": 0,
  "ChestPainType_NAP": 0,
  "ChestPainType_TA": 0,
  "RestingECG_Normal": 1,
  "RestingECG_ST": 0,
  "ExerciseAngina_Y": 0,
  "ST_Slope_Flat": 0,
  "ST_Slope_Up": 1
}
```

### Ejemplo de response

```json
{
  "prediction": 1,
  "probability": 0.8734,
  "label": "Enfermedad cardíaca detectada"
}
```

---

## Resumen del Notebook

**Análisis Exploratorio y Limpieza**

Se detectaron valores `0` en dos variables fisiológicamente críticas. En `RestingBP` se identificó un único registro con valor 0 mm Hg (fila 449), imputado con la mediana de los valores válidos. En `Cholesterol` se detectaron 172 registros con valor 0 mg/dl (aproximadamente el 19% del dataset), tratados como datos faltantes mal codificados e imputados con la mediana de valores mayores a cero (237 mg/dl).

**Preprocesamiento**

Las variables categóricas (`Sex`, `ChestPainType`, `RestingECG`, `ExerciseAngina`, `ST_Slope`) fueron codificadas mediante `pd.get_dummies()` con `drop_first=True` para evitar multicolinealidad. Las variables numéricas fueron estandarizadas con `StandardScaler`. La partición de datos se realizó en proporción 80/20 con estratificación sobre la variable objetivo.

**Comparación de modelos**

Se entrenaron y evaluaron tres algoritmos de clasificación:

| Modelo                          | Accuracy   |
| ------------------------------- | ---------- |
| Logistic Regression             | mayor      |
| Random Forest                   | intermedio |
| Decision Tree (`max_depth=3`) | menor      |

Se seleccionó la **Regresión Logística** como modelo final por obtener la mayor exactitud en el conjunto de prueba. Tanto el modelo como el escalador fueron exportados con `joblib` en la carpeta `model/`.
