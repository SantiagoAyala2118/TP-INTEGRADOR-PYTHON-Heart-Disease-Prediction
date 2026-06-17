import React, { useEffect, useRef } from "react";

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Gauge SVG animado que muestra la probabilidad de enfermedad cardíaca.
 */
function ProbabilityGauge({ probability, isDisease }) {
  const circleRef = useRef(null);

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;
    // Partimos del círculo completo (oculto) y animamos hasta el offset correcto
    const targetOffset = CIRCUMFERENCE - probability * CIRCUMFERENCE;
    circle.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)";
    circle.style.strokeDashoffset = targetOffset;
  }, [probability]);

  const color = isDisease ? "#E63946" : "#2DC653";
  const pct = Math.round(probability * 100);

  return (
    <div className="gauge-container">
      <svg className="gauge-svg" viewBox="0 0 120 120">
        {/* Track */}
        <circle
          cx="60" cy="60" r={RADIUS}
          fill="none"
          stroke="#1E3050"
          strokeWidth="10"
        />
        {/* Progreso */}
        <circle
          ref={circleRef}
          cx="60" cy="60" r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE} /* empieza en 0% */
          transform="rotate(-90 60 60)"
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
        />
        {/* Texto central */}
        <text x="60" y="55" textAnchor="middle" className="gauge-pct" fill={color}>
          {pct}%
        </text>
        <text x="60" y="72" textAnchor="middle" className="gauge-label" fill="#8899B3">
          probabilidad
        </text>
      </svg>
    </div>
  );
}

/**
 * Tarjeta de resultado. Muestra la predicción, la probabilidad y la etiqueta.
 * @param {{ result: {prediction: number, probability: number, label: string} | null, error: string | null }} props
 */
export default function ResultCard({ result, error }) {
  if (error) {
    return (
      <div className="result-card result-card--error">
        <div className="result-error-icon">!</div>
        <h3 className="result-error-title">Error de predicción</h3>
        <p className="result-error-msg">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="result-card result-card--empty">
        <div className="result-empty-icon">◎</div>
        <p className="result-empty-text">
          Completá los datos del paciente y ejecutá la predicción para ver el resultado aquí.
        </p>
      </div>
    );
  }

  const isDisease = result.prediction === 1;
  const color = isDisease ? "#E63946" : "#2DC653";

  return (
    <div className={`result-card ${isDisease ? "result-card--disease" : "result-card--healthy"}`}>
      <div className="result-header">
        <span className="result-eyebrow">Resultado del Modelo</span>
        <span
          className="result-badge"
          style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
        >
          {isDisease ? "Positivo" : "Negativo"}
        </span>
      </div>

      <ProbabilityGauge probability={result.probability} isDisease={isDisease} />

      <h2 className="result-label" style={{ color }}>
        {result.label}
      </h2>

      <div className="result-stats">
        <div className="stat-item">
          <span className="stat-value" style={{ color }}>{Math.round(result.probability * 100)}%</span>
          <span className="stat-name">Prob. de Enfermedad</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value" style={{ color: isDisease ? "#2DC653" : "#E63946" }}>
            {Math.round((1 - result.probability) * 100)}%
          </span>
          <span className="stat-name">Prob. de Salud</span>
        </div>
      </div>

      <p className="result-disclaimer">
        Este resultado es orientativo. No reemplaza el diagnóstico clínico profesional.
      </p>
    </div>
  );
}