import React, { useState } from "react";

// Valores iniciales del formulario
const INITIAL_STATE = {
  Age: "",
  Sex: "M",
  ChestPainType: "ASY",
  RestingBP: "",
  Cholesterol: "",
  FastingBS: "0",
  RestingECG: "Normal",
  MaxHR: "",
  ExerciseAngina: "N",
  Oldpeak: "",
  ST_Slope: "Flat",
};

// Definición de campos select con sus opciones
const SELECT_OPTIONS = {
  Sex: [
    { value: "F", label: "Femenino" },
    { value: "M", label: "Masculino" },
  ],
  ChestPainType: [
    { value: "ASY", label: "ASY — Asintomático" },
    { value: "ATA", label: "ATA — Angina Atípica" },
    { value: "NAP", label: "NAP — Dolor No Anginoso" },
    { value: "TA", label: "TA — Angina Típica" },
  ],
  FastingBS: [
    { value: "0", label: "No (≤ 120 mg/dl)" },
    { value: "1", label: "Sí (> 120 mg/dl)" },
  ],
  RestingECG: [
    { value: "LVH", label: "LVH — Hipertrofia Ventricular Izq." },
    { value: "Normal", label: "Normal" },
    { value: "ST", label: "ST — Anomalía Onda ST-T" },
  ],
  ExerciseAngina: [
    { value: "N", label: "No" },
    { value: "Y", label: "Sí" },
  ],
  ST_Slope: [
    { value: "Down", label: "Down — Descendente" },
    { value: "Flat", label: "Flat — Plana" },
    { value: "Up", label: "Up — Ascendente" },
  ],
};

/**
 * Formulario de predicción cardíaca organizado en 3 secciones clínicas.
 * @param {{ onSubmit: Function, isLoading: boolean }} props
 */
export default function PredictionForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.Age || formData.Age < 1 || formData.Age > 120)
      newErrors.Age = "Ingresá una edad válida (1–120)";
    if (!formData.RestingBP || formData.RestingBP < 50 || formData.RestingBP > 250)
      newErrors.RestingBP = "Ingresá una presión válida (50–250 mm Hg)";
    if (!formData.Cholesterol || formData.Cholesterol < 100 || formData.Cholesterol > 600)
      newErrors.Cholesterol = "Ingresá un colesterol válido (100–600 mg/dl)";
    if (!formData.MaxHR || formData.MaxHR < 60 || formData.MaxHR > 220)
      newErrors.MaxHR = "Ingresá una FC máxima válida (60–220 lpm)";
    if (formData.Oldpeak === "" || isNaN(formData.Oldpeak))
      newErrors.Oldpeak = "Ingresá un valor numérico para Oldpeak";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Enviamos los valores en su forma original (strings + números)
    // api.js se encarga de construir las 16 features del modelo
    onSubmit({
      Age:            parseInt(formData.Age),
      Sex:            formData.Sex,
      ChestPainType:  formData.ChestPainType,
      RestingBP:      parseInt(formData.RestingBP),
      Cholesterol:    parseInt(formData.Cholesterol),
      FastingBS:      parseInt(formData.FastingBS),
      RestingECG:     formData.RestingECG,
      MaxHR:          parseInt(formData.MaxHR),
      ExerciseAngina: formData.ExerciseAngina,
      Oldpeak:        parseFloat(formData.Oldpeak),
      ST_Slope:       formData.ST_Slope,
    });
  };

  const renderSelect = (name, label) => (
    <div className="field-group" key={name}>
      <label className="field-label" htmlFor={name}>{label}</label>
      <select
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="field-select"
      >
        {SELECT_OPTIONS[name].map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const renderNumber = (name, label, placeholder, step = "1") => (
    <div className="field-group" key={name}>
      <label className="field-label" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type="number"
        step={step}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`field-input ${errors[name] ? "field-input--error" : ""}`}
      />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </div>
  );

  return (
    <form className="prediction-form" onSubmit={handleSubmit} noValidate>
      {/* Sección 1: Datos Demográficos */}
      <section className="form-section">
        <h2 className="section-title">
          <span className="section-number">01</span>
          Datos Demográficos
        </h2>
        <div className="fields-grid">
          {renderNumber("Age", "Edad", "ej. 52", "1")}
          {renderSelect("Sex", "Sexo")}
        </div>
      </section>

      {/* Sección 2: Signos Vitales */}
      <section className="form-section">
        <h2 className="section-title">
          <span className="section-number">02</span>
          Signos Vitales
        </h2>
        <div className="fields-grid">
          {renderNumber("RestingBP", "Presión Arterial en Reposo (mm Hg)", "ej. 130")}
          {renderNumber("Cholesterol", "Colesterol Sérico (mg/dl)", "ej. 237")}
          {renderSelect("FastingBS", "Glucemia en Ayunas")}
          {renderNumber("MaxHR", "Frecuencia Cardíaca Máxima (lpm)", "ej. 150")}
        </div>
      </section>

      {/* Sección 3: Evaluación Cardíaca */}
      <section className="form-section">
        <h2 className="section-title">
          <span className="section-number">03</span>
          Evaluación Cardíaca
        </h2>
        <div className="fields-grid">
          {renderSelect("ChestPainType", "Tipo de Dolor de Pecho")}
          {renderSelect("RestingECG", "ECG en Reposo")}
          {renderSelect("ExerciseAngina", "Angina por Ejercicio")}
          {renderNumber("Oldpeak", "Depresión ST (Oldpeak)", "ej. 1.0", "0.1")}
          {renderSelect("ST_Slope", "Pendiente Segmento ST")}
        </div>
      </section>

      <div className="form-footer">
        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="btn-spinner" />
              Analizando...
            </>
          ) : (
            "Ejecutar Predicción"
          )}
        </button>
      </div>
    </form>
  );
}