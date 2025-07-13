import axios from "axios";

const VITE_API_URL = "http://localhost:3000/api";

// Configurar headers con token
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Obtener todos los permisos
export const obtenerPermisos = async () => {
  try {
    const response = await axios.get(`${VITE_API_URL}/permiso`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener permisos:", error);
    throw new Error(
      error.response?.data?.message || "Error al obtener permisos"
    );
  }
};

export const obtenerPermisosPorRol = async (id_rol) => {
  try {
    const response = await axios.get(`${VITE_API_URL}/permiso/rol/${id_rol}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener permisos para el rol ${id_rol}:`, error);
    throw new Error(
      error.response?.data?.message ||
        `Error al obtener permisos asociados al rol ${id_rol}`
    );
  }
};

// Obtener permisos por usuario/rol
export const obtenerPermisosPorUsuario = async (id_usuario) => {
  try {
    const response = await axios.get(
      `${VITE_API_URL}/permiso/usuario/${id_usuario}`,
      {
        headers: getAuthHeaders(),
      }
    );
    console.log("Permisos obtenidos:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      `Error al obtener permisos para el usuario ${id_usuario}:`,
      error
    );
    throw new Error(
      error.response?.data?.message ||
        `Error al obtener permisos asociados al usuario ${id_usuario}`
    );
  }
};

// Crear un nuevo permiso
export const crearPermiso = async (datosPermiso) => {
  try {
    console.log("Intentando crear permiso con datos:", datosPermiso);
    const response = await axios.post(`${VITE_API_URL}/permiso`, datosPermiso, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error al crear permiso:", error);
    throw new Error(error.response?.data?.message || "Error al crear permiso");
  }
};

// Actualizar un permiso existente
export const actualizarPermiso = async (id, datosActualizados) => {
  try {
    const response = await axios.put(
      `${VITE_API_URL}/permiso/${id}`,
      datosActualizados,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error al actualizar permiso con ID ${id}:`, error);
    throw new Error(
      error.response?.data?.message ||
        `Error al actualizar permiso con ID ${id}`
    );
  }
};

// Eliminar un permiso
export const eliminarPermiso = async (id) => {
  try {
    const response = await axios.delete(`${VITE_API_URL}/permiso/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar permiso con ID ${id}:`, error);
    throw new Error(
      error.response?.data?.message || `Error al eliminar permiso con ID ${id}`
    );
  }
};
