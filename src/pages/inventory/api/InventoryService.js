import axios from "axios";

const VITE_API_URL = "http://localhost:3000/api";

// ✅ Crear item de inventario (POST)
export const createInventario = async (inventarioData) => {
  try {
    const token = localStorage.getItem("token");
    console.log("Enviando datos al servidor:", inventarioData);
    const res = await axios.post(`${VITE_API_URL}/inventory`, inventarioData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.data;
  } catch (error) {
    if (error.response?.data?.errores) {
      console.error("Errores del backend:", error.response.data.errores);
      const errorMessage = error.response.data.errores
        .map((err) => typeof err === "string" ? err : err.mensaje || JSON.stringify(err))
        .join(", ");
      error.message = errorMessage || error.message;
    } else if (error.response?.data?.mensaje) {
      console.error("Mensaje de error del backend:", error.response.data.mensaje);
      error.message = error.response.data.mensaje;
    } else {
      console.error("Error al crear item de inventario:", error.message);
    }
    throw error;
  }
};

// ✅ Obtener todo el inventario (GET)
export const fetchInventario = async () => {
  try {
    const token = localStorage.getItem("token");
    console.log("Solicitando inventario al servidor...");
    const res = await axios.get(`${VITE_API_URL}/inventory`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Respuesta completaaaaa del servidor:", res.data);

    if (res.data) {
      console.log("Inventario obtenido:", res.data);
      return res.data;
    } else {
      console.warn("Estructura de respuesta inesperada:", res.data);
      return Array.isArray(res.data) ? res.data : [];
    }
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    if (error.response) {
      console.error("Detalles del error:", error.response.data);
    }
    throw error;
  }
};

// ✅ Actualizar item de inventario por ID (PUT)
export const updateInventario = async (id, inventarioData) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.put(`${VITE_API_URL}/inventory/${id}`, inventarioData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Item de inventario actualizado:", res.data.data);
    return res.data.data;
  } catch (error) {
    console.error("Error al actualizar item de inventario", error);
    if (error.response?.data?.mensaje) {
      error.message = error.response.data.mensaje;
    }
    throw error;
  }
};

// ✅ Eliminar item de inventario por ID (DELETE)
export const deleteInventario = async (id) => {
  try {
    const token = localStorage.getItem("token");
    console.log(`Eliminando item de inventario con ID: ${id}`);
    const res = await axios.delete(`${VITE_API_URL}/inventory/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Respuesta completa al eliminar:", res);
    return res.data;
  } catch (error) {
    console.error("Error al eliminar item de inventario:", error);
    if (error.response) {
      console.error("Detalles del error:", error.response.data);
      if (error.response.data.mensaje) {
        error.message = error.response.data.mensaje;
      }
    }
    throw error;
  }
};

// ✅ Actualizar cantidad de inventario (PATCH)
export const updateInventarioCantidad = async (id, cantidad) => {
  try {
    const token = localStorage.getItem("token");
    console.log(`Actualizando cantidad del item ${id} a ${cantidad}`);
    
    const res = await axios.patch(
      `${VITE_API_URL}/inventory/${id}/cantidad`,
      { cantidad },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Respuesta completa al actualizar cantidad:", res);
    return res.data.data;
  } catch (error) {
    console.error("Error al actualizar cantidad:", error);
    if (error.response?.data?.mensaje) {
      error.message = error.response.data.mensaje;
    }
    throw error;
  }
};

// ✅ Obtener item de inventario por código (GET)
export const getInventarioByCodigo = async (codigo) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${VITE_API_URL}/inventory/codigo/${codigo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.data;
  } catch (error) {
    console.error("Error al buscar item por código:", error);
    if (error.response?.data?.mensaje) {
      error.message = error.response.data.mensaje;
    }
    throw error;
  }
};