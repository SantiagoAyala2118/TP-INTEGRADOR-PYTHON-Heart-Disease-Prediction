import React from "react";

/**
 * Header de la aplicación. Muestra el título y el estado de conexión con la API.
 * @param {{ apiStatus: 'ok'|'error'|'checking' }} props
 */
export default function Header({ apiStatus }) {
  const statusMap = {
    ok: { label: "API conectada", className: "status-dot status-ok" },
    error: { label: "API sin conexión", className: "status-dot status-error" },
    checking: { label: "Verificando...", className: "status-dot status-checking" },
  };

  const current = statusMap[apiStatus] ?? statusMap.checking;

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-brand">
          <span className="header-icon">♥</span>
          <div>
            <h1 className="header-title">CardioPredict</h1>
            <p className="header-subtitle">Predicción de Enfermedades Cardíacas · Regresión Logística</p>
          </div>
        </div>
        <div className="header-status">
          <span className={current.className} />
          <span className="status-label">{current.label}</span>
        </div>
      </div>
    </header>
  );
}