// Servicio para manejar las operaciones de ventas
import axios from "axios";

const VITE_API_URL = "http://localhost:3000/api";

// URL base para obtener todas las ventas
export const fetchVentas = async () => {
  try {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");

    // Si el usuario es administrador, obtener todas las ventas
    // Si es empleado, obtener solo sus ventas
    let url = `${VITE_API_URL}/ventas`;
    if (userData.id_rol !== 1 && userData.id) {
      url = `${VITE_API_URL}/ventas?usuario_id=${userData.id}`;
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    throw error;
  }
};

// Obtener una venta por ID
export const fetchVentaById = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");

    const response = await axios.get(`${VITE_API_URL}/ventas/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Si no es administrador, verificar que la venta pertenezca al usuario
    if (
      userData.id_rol !== 1 &&
      response.data.data.usuario_id !== userData.id
    ) {
      throw new Error("No tienes permiso para ver esta venta");
    }

    return response.data.data;
  } catch (error) {
    console.error(`Error al obtener venta con ID ${id}:`, error);
    throw error;
  }
};

// Crear una nueva venta
export const createVenta = async (ventaData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${VITE_API_URL}/ventas`, ventaData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response?.data.data;
  } catch (error) {
    console.error("Error al crear venta:", error);
    throw error.response?.data || error;
  }
};

// Actualizar una venta existente
export const updateVenta = async (id, ventaData) => {
  try {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");

    // Verificar si el usuario tiene permiso para actualizar esta venta
    if (userData.id_rol !== 1) {
      // Si no es admin, verificar que la venta le pertenezca
      const ventaActual = await fetchVentaById(id);
      if (ventaActual.usuario_id !== userData.id) {
        throw new Error("No tienes permiso para actualizar esta venta");
      }
    }

    const response = await axios.put(
      `${VITE_API_URL}/ventas/${id}/metodo-pago`,
      ventaData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response?.data?.data;
  } catch (error) {
    console.error(`Error al actualizar venta con ID ${id}:`, error);
    throw error.response?.data || error;
  }
};

// Eliminar una venta
export const deleteVenta = async (id) => {
  try {
    // Verificar si el usuario es administrador
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.id_rol !== 1) {
      throw new Error("Solo los administradores pueden eliminar ventas");
    }

    const token = localStorage.getItem("token");
    const response = await axios.delete(`${VITE_API_URL}/ventas/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error al eliminar venta con ID ${id}:`, error);
    throw error;
  }
};

// Obtener pedidos en estado "terminado" para crear ventas
export const fetchPedidosTerminados = async () => {
  try {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");

    // Si es administrador, obtener todos los pedidos terminados
    // Si es empleado, obtener solo los pedidos asignados a él
    let url = `${VITE_API_URL}/pedidos/pedido?estado=terminado`;
    if (userData.id_rol !== 1 && userData.id) {
      url = `${VITE_API_URL}/pedidos/pedido?estado=terminado&usuario_id=${userData.id}`;
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error al obtener pedidos terminados:", error);
    throw error;
  }
};
