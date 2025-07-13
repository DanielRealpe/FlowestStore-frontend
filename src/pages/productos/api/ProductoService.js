import axios from "axios";

const VITE_API_URL = "http://localhost:3000/api";

// ✅ Crear producto (POST)
export const createProducto = async (productoData) => {
  try {
    const token = localStorage.getItem("token");
    console.log("Enviando datos al servidor:", productoData);
    const res = await axios.post(`${VITE_API_URL}/productos`, productoData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Respuesta del servidor:", res.data);
    return res.data.data;
  } catch (error) {
    if (error.response?.data?.errores) {
      console.error("Errores del backend:", error.response.data.errores);
      error.response.data.errores.forEach((err, index) => {
        console.error(`Error ${index + 1}:`, err);
      });
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
      console.error("Error al crear producto:", error.message);
    }
    throw error;
  }
};

// ✅ Obtener todos los productos (GET)
export const fetchProductos = async () => {
  try {
    const token = localStorage.getItem("token")
    const res = await axios.get(`${VITE_API_URL}/productos?include=categoria`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    console.log("Productos obtenidos:", res.data.data)
    return res.data.data
  } catch (error) {
    console.error("Error al obtener productos", error);
    throw error;
  }
};

// ✅ Obtener producto por ID (GET)
export const fetchProductoById = async (id) => {
  try {
    const token = localStorage.getItem("token")
    const res = await axios.get(`${VITE_API_URL}/productos/${id}?include=categoria`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    console.log("Producto obtenido por ID:", res.data.data)
    return res.data.data
  } catch (error) {
    console.error("Error al obtener producto por ID", error);
    if (error.response?.data?.mensaje) {
      error.message = error.response.data.mensaje;
    }
    throw error;
  }
};

// ✅ Actualizar producto por ID (PUT)
export const updateProducto = async (id, productoData) => {
  try {
    const token = localStorage.getItem("token");
    console.log(`Actualizando producto con ID ${id}:`, productoData);
    const res = await axios.put(
      `${VITE_API_URL}/productos/${id}`,
      productoData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Respuesta del servidor:", res.data);
    return res.data.data;
  } catch (error) {
    console.error("Error al actualizar producto", error);
    if (error.response?.data?.mensaje) {
      error.message = error.response.data.mensaje;
    }
    throw error;
  }
};

// ✅ Eliminar producto por ID (DELETE)
export const deleteProducto = async (id) => {
  try {
    const token = localStorage.getItem("token");
    console.log(`Eliminando producto con ID: ${id}`);
    const res = await axios.delete(`${VITE_API_URL}/productos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Producto eliminado:", res.data.message || res.data);
    return res.data;
  } catch (error) {
    console.error("Error al eliminar producto", error);
    if (error.response?.data?.mensaje) {
      error.message = error.response.data.mensaje;
    }
    throw error;
  }
};

// ✅ Cambiar estado del producto (PATCH)
export const toggleProductoEstado = async (id, estadoActual) => {
  try {
    // Verificar si el usuario es administrador
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.id_rol !== 1) {
      throw new Error(
        "Solo los administradores pueden cambiar el estado de los productos"
      );
    }

    const token = localStorage.getItem("token");
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";
    console.log(
      `Cambiando estado del producto ${id} de ${estadoActual} a ${nuevoEstado}`
    );

    // Intentar con PATCH primero
    try {
      const res = await axios.patch(
        `${VITE_API_URL}/productos/${id}/estado`,
        {
          estado: nuevoEstado,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Respuesta del servidor (PATCH):", res.data);
      return res.data;
    } catch (patchError) {
      // Si falla el PATCH, intentar con PUT como fallback
      console.log(
        "PATCH falló, intentando con PUT como fallback:",
        patchError.message
      );

      const res = await axios.put(
        `${VITE_API_URL}/productos/${id}`,
        {
          estado: nuevoEstado,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Respuesta del servidor (fallback):", res.data);
      return res.data;
    }
  } catch (error) {
    console.error("Error al cambiar estado del producto:", error);
    if (error.response?.data?.mensaje) {
      error.message = error.response.data.mensaje;
    }
    throw error;
  }
}