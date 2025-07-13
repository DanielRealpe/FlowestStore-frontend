import axios from "axios";

const VITE_API_URL = "http://localhost:3000/api";

// ✅ Crear cliente (POST)
export const createCliente = async (clienteData) => {
  try {
    const token = localStorage.getItem("token");
    console.log("Enviando datos al servidor:", clienteData);
    const res = await axios.post(`${VITE_API_URL}/clientes`, clienteData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.data;
  } catch (error) {
    if (error.response?.data?.errores) {
      console.error("Errores del backend:", error.response.data.errores);
      // Mostrar cada error en la consola para depuración
      error.response.data.errores.forEach((err, index) => {
        console.error(`Error ${index + 1}:`, err);
      });
      // Crear un mensaje de error más descriptivo
      const errorMessage = error.response.data.errores
        .map((err) =>
          typeof err === "string" ? err : err.mensaje || JSON.stringify(err)
        )
        .join(", ");
      error.message = errorMessage || error.message;
    } else if (error.response?.data?.mensaje) {
      console.error(
        "Mensaje de error del backend:",
        error.response.data.mensaje
      );
      error.message = error.response.data.mensaje;
    } else {
      console.error("Error al crear cliente:", error.message);
    }
    throw error;
  }
};

// ✅ Obtener todos los clientes (GET)
export const fetchClientes = async () => {
  try {
    const token = localStorage.getItem("token");
    console.log("Solicitando clientes al servidor...");
    const res = await axios.get(`${VITE_API_URL}/clientes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Respuesta completa del servidor:", res);

    // Verificar la estructura de la respuesta
    if (res.data && res.data.data) {
      console.log("Clientes obtenidos:", res.data.data);
      return res.data.data;
    } else {
      console.warn("Estructura de respuesta inesperada:", res.data);
      // Intentar encontrar los datos en la respuesta
      if (Array.isArray(res.data)) {
        return res.data;
      }
      return [];
    }
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    if (error.response) {
      console.error("Detalles del error:", error.response.data);
    }
    throw error;
  }
};

// ✅ Actualizar cliente por ID (PUT)
export const updateCliente = async (id, clienteData) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.put(`${VITE_API_URL}/clientes/${id}`, clienteData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Cliente actualizado:", res.data.data);
    return res.data.data;
  } catch (error) {
    console.error("Error al actualizar cliente", error);
    if (error.response?.data?.mensaje) {
      error.message = error.response.data.mensaje;
    }
    throw error;
  }
};

// ✅ Eliminar cliente por ID (DELETE)
export const deleteCliente = async (id) => {
  try {
    const token = localStorage.getItem("token");
    console.log(`Eliminando cliente con ID: ${id}`);
    const res = await axios.delete(`${VITE_API_URL}/clientes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Respuesta completa al eliminar:", res);
    return res.data;
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    if (error.response) {
      console.error("Detalles del error:", error.response.data);
      if (error.response.data.mensaje) {
        error.message = error.response.data.mensaje;
      }
    }
    throw error;
  }
};

// ✅ Cambiar estado del cliente (PUT)
export const toggleClienteEstado = async (id, estado) => {
  try {
    // Verificar si el usuario es administrador
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.id_rol !== 1) {
      throw new Error(
        "Solo los administradores pueden cambiar el estado de los clientes"
      );
    }

    const token = localStorage.getItem("token");
    const nuevoEstado = estado === "activo" ? "inactivo" : "activo";
    console.log(
      `Cambiando estado del cliente ${id} de ${estado} a ${nuevoEstado}`
    );

    const res = await axios.patch(
      `${VITE_API_URL}/clientes/${id}/estado`,
      {
        estado: nuevoEstado,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Respuesta completa al cambiar estado:", res);

    // Verifica la estructura de la respuesta
    if (res && res.data && res.data.exito) {
      // Devuelve los datos actualizados del cliente o al menos el estado actualizado
      return res.data.data || { id, estado: nuevoEstado };
    }

    return { id, estado: nuevoEstado };
  } catch (error) {
    console.error("Error al cambiar estado del cliente:", error);
    if (error.response) {
      console.error("Detalles del error:", error.response.data);
      if (error.response.data.mensaje) {
        error.message = error.response.data.mensaje;
      }
    }
    throw error;
  }
};
