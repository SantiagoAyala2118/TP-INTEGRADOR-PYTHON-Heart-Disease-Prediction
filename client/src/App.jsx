import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import PredictionForm from "./components/PredictionForm";
import ResultCard from "./components/ResultCard";
import { predictHeartDisease, checkHealth } from "./services/api";
import "./App.css";

export default function App() {
  const [apiStatus, setApiStatus] = useState("checking");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Verificamos la salud de la API al montar el componente
  useEffect(() => {
    checkHealth()
      .then((data) => setApiStatus(data.model_loaded ? "ok" : "error"))
      .catch(() => setApiStatus("error"));
  }, []);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await predictHeartDisease(formData);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-root">
      <Header apiStatus={apiStatus} />

      <main className="app-main">
        <div className="layout-grid">
          {/* Panel izquierdo: formulario */}
          <div className="panel panel--form">
            <p className="panel-description">
              Ingresá los datos clínicos del paciente. El modelo de Regresión Logística
              evaluará el riesgo de enfermedad cardíaca.
            </p>
            <PredictionForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {/* Panel derecho: resultado */}
          <aside className="panel panel--result">
            <h2 className="panel-title">Diagnóstico Predictivo</h2>
            <ResultCard result={result} error={error} />

            {/* Info del modelo */}
            <div className="model-info">
              <h3 className="model-info-title">Sobre el modelo</h3>
              <div className="model-stats-grid">
                <div className="model-stat">
                  <span className="model-stat-value">89.9%</span>
                  <span className="model-stat-label">Exactitud (Test)</span>
                </div>
                <div className="model-stat">
                  <span className="model-stat-value">917</span>
                  <span className="model-stat-label">Registros de entrenamiento</span>
                </div>
                <div className="model-stat">
                  <span className="model-stat-value">LogReg</span>
                  <span className="model-stat-label">Algoritmo</span>
                </div>
                <div className="model-stat">
                  <span className="model-stat-value">11</span>
                  <span className="model-stat-label">Variables clínicas</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="app-footer">
        <span>Trabajo Práctico Final · Python para Ciencia de Datos · 2026</span>
        <span>Ayala · Zagaña · Zigaran</span>
      </footer>
    </div>
  );
}