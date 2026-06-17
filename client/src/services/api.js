// src/services/api.js
const API_URL = 'http://localhost:8000';

export const checkHealth = async () => {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) throw new Error("API Inaccesible");
    return await response.json();
};

export const predictHeartDisease = async (patientData) => {
    try {
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(patientData),
        });

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error en la petición de predicción:", error);
        throw error;
    }
};