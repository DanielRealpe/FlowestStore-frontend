import axios from "axios";

const VITE_API_URL = "http://localhost:3000/api";

// ✅ Crear categoría (POST)
export const createCategoria = async (categoryData) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(`${VITE_API_URL}/categoria`, categoryData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
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
      console.error("Error al crear categoria:", error.message);
    }
    throw error;
  }
};

// ✅ Obtener todas las categorías (GET)
export const fetchCategorias = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${VITE_API_URL}/categoria`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    console.error("Error al obtener categorias", error);
    throw error;
  }
};

// ✅ Obtener categoría por ID (GET)
export const fetchCategoriaById = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${VITE_API_URL}/categoria/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Verificar la estructura de la respuesta
    if (res.data && res.data.data) {
      return res.data.data;
    } else if (res.data) {
      return res.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al obtener categoria por ID", error);
    if (error.response?.data?.mensaje) {
      error.message = error.response.data.mensaje;
    }
    throw error;
  }
};

// ✅ Actualizar categoría por ID (PUT)
export const updateCategoria = async (id, categoryData) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.put(
      `${VITE_API_URL}/categoria/${id}`,
      categoryData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Verificar la estructura de la respuesta
    if (res.data && res.data.data) {
      return res.data.data;
    } else if (res.data) {
      return res.data;
    } else {
      return {};
    }
  } catch (error) {
    console.error("Error al actualizar categoria", error);
    if (error.response?.data?.mensaje) {
      error.message = error.response.data.mensaje;
    }
    throw error;
  }
};

// ✅ Eliminar categoría por ID (DELETE)
export const deleteCategoria = async (id) => {
  try {
    const token = localStorage.getItem("token");
    console.log(`Eliminando categoría con ID: ${id}`);
    const res = await axios.delete(`${VITE_API_URL}/categoria/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Categoría eliminada:", res.data.message || res.data);
    return res.data;
  } catch (error) {
    console.error("Error al eliminar categoria", error);
    if (error.response?.data?.mensaje) {
      error.message = error.response.data.mensaje;
    }
    throw error;
  }
};

// ✅ Cambiar estado de la categoría (PATCH)
export const toggleCategoriaEstado = async (id, estadoActual) => {
  try {
    // Verificar si el usuario es administrador
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.id_rol !== 1) {
      throw new Error(
        "Solo los administradores pueden cambiar el estado de las categorías"
      );
    }

    const token = localStorage.getItem("token");
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";
    console.log(
      `Cambiando estado de la categoría ${id} de ${estadoActual} a ${nuevoEstado}`
    );

    // Intentar con PATCH primero
    try {
      const res = await axios.patch(
        `${VITE_API_URL}/categoria/${id}/estado`,
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
        `${VITE_API_URL}/categoria/${id}`,
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
    console.error("Error al cambiar estado de la categoría:", error);
    if (error.response?.data?.mensaje) {
      error.message = error.response.data.mensaje;
    }
    throw error;
  }
};
