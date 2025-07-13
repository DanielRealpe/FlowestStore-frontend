import axios from "axios";

// Configura la URL base correctamente - Ajusta según tu entorno
const VITE_API_URL = "http://localhost:3000/api";

// Solicitar código de recuperación
export const solicitarRecuperacion = async (email) => {
  try {
    console.log("Enviando solicitud de recuperación para:", email);
    const response = await axios.post(
      `${VITE_API_URL}/recuperacion/solicitar`,
      { email }
    );
    console.log("Respuesta recibida:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al solicitar recuperación:", error);
    console.error("Detalles del error:", error.response?.data);
    throw new Error(
      error.response?.data?.mensaje || "Error al solicitar recuperación"
    );
  }
};

// Verificar código de recuperación
export const verificarCodigo = async (email, codigo) => {
  try {
    const response = await axios.post(
      `${VITE_API_URL}/recuperacion/verificar`,
      { email, codigo }
    );
    return response.data;
  } catch (error) {
    console.error("Error al verificar código:", error);
    throw new Error(
      error.response?.data?.mensaje || "Error al verificar código"
    );
  }
};

// Cambiar contraseña
export const cambiarPassword = async (usuario_id, codigo_id, password) => {
  try {
    const response = await axios.post(
      `${VITE_API_URL}/recuperacion/cambiar-password`,
      {
        usuario_id,
        codigo_id,
        password,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    throw new Error(
      error.response?.data?.mensaje || "Error al cambiar contraseña"
    );
  }
};
