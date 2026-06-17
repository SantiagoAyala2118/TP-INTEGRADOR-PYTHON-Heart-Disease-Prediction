// src/services/api.js
const API_URL = 'http://localhost:8000';

export const checkHealth = async () => {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) throw new Error("API Inaccesible");
    return await response.json();
};

/**
 * Convierte los datos del formulario (legibles) a las 16 features
 * que espera el modelo (post get_dummies con drop_first=True).
 */
const buildModelFeatures = (form) => {
    // RestingBPMedido: el notebook lo puso en 0 solo si RestingBP era 0 (dato faltante)
    const restingBPMedido = form.RestingBP === 0 ? 0 : 1;

    return {
        // Numéricas directas
        Age:              form.Age,
        RestingBP:        form.RestingBP,
        Cholesterol:      form.Cholesterol,
        FastingBS:        form.FastingBS,
        MaxHR:            form.MaxHR,
        Oldpeak:          form.Oldpeak,
        RestingBPMedido:  restingBPMedido,

        // Sex (base = F → drop_first elimina Sex_F, queda Sex_M)
        Sex_M:                  form.Sex === "M" ? 1 : 0,

        // ChestPainType (base = ASY → quedan NAP, TA, ATA)
        ChestPainType_NAP:      form.ChestPainType === "NAP" ? 1 : 0,
        ChestPainType_TA:       form.ChestPainType === "TA"  ? 1 : 0,
        ChestPainType_ATA:      form.ChestPainType === "ATA" ? 1 : 0,

        // RestingECG (base = LVH → quedan Normal, ST)
        RestingECG_Normal:      form.RestingECG === "Normal" ? 1 : 0,
        RestingECG_ST:          form.RestingECG === "ST"     ? 1 : 0,

        // ExerciseAngina (base = N → queda Y)
        ExerciseAngina_Y:       form.ExerciseAngina === "Y" ? 1 : 0,

        // ST_Slope (base = Down → quedan Flat, Up)
        ST_Slope_Flat:          form.ST_Slope === "Flat" ? 1 : 0,
        ST_Slope_Up:            form.ST_Slope === "Up"   ? 1 : 0,
    };
};

export const predictHeartDisease = async (formData) => {
    try {
        const payload = buildModelFeatures(formData);

        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const detail = await response.json().catch(() => ({}));
            throw new Error(detail.detail || `Error en el servidor: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error en la petición de predicción:", error);
        throw error;
    }
};