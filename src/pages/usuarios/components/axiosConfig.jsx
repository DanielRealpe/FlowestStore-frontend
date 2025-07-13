

// Función de ayuda para depurar respuestas
const logResponse = (action, response) => {
  console.log(`[${action}] Respuesta del servidor:`, response)
  return response
}

// ✅ Crear categoría (POST)
export const createCategoria = async (categoryData) => {
  try {
    console.log("Datos de categoría a enviar:", categoryData)

    // Asegurarse de que el estado sea un booleano si el backend lo espera así
    if (typeof categoryData.estado === "string") {
      categoryData.estado = categoryData.estado === "activo"
    }

    const res = await axiosInstance.post(`/categoria`, categoryData)
    return logResponse("Crear categoría", res.data)
  } catch (error) {
    console.error("Error completo al crear categoría:", error)

    if (error.response) {
      console.error("Detalles de la respuesta de error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      })
    }

    if (error.response?.data?.errores) {
      const errorMessage = error.response.data.errores
        .map((err) => (typeof err === "string" ? err : err.mensaje || JSON.stringify(err)))
        .join(", ")
      error.message = errorMessage || error.message
    } else if (error.response?.data?.mensaje) {
      error.message = error.response.data.mensaje
    }

    throw error
  }
}

// ✅ Obtener todas las categorías (GET)
export const fetchCategorias = async () => {
  try {
    console.log("Solicitando categorías...")
    const res = await axiosInstance.get(`/categoria`)

    // Depurar la estructura de la respuesta
    console.log("Respuesta completa de categorías:", res)

    // Manejar diferentes estructuras de respuesta posibles
    if (res.data && Array.isArray(res.data)) {
      return { data: res.data }
    } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
      return res.data
    } else if (res.data && typeof res.data === "object") {
      // Si la respuesta no tiene el formato esperado pero es un objeto
      console.log("Formato de respuesta inesperado, intentando adaptar:", res.data)
      return { data: Array.isArray(res.data) ? res.data : [res.data] }
    } else {
      console.error("Formato de respuesta no reconocido:", res.data)
      return { data: [] }
    }
  } catch (error) {
    console.error("Error completo al obtener categorías:", error)

    if (error.response) {
      console.error("Detalles de la respuesta de error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      })
    }

    throw error
  }
}

// ✅ Obtener categoría por ID (GET)
export const fetchCategoriaById = async (id) => {
  try {
    const res = await axiosInstance.get(`/categoria/${id}`)

    // Depurar la estructura de la respuesta
    console.log(`Respuesta de categoría ID ${id}:`, res.data)

    // Manejar diferentes estructuras de respuesta posibles
    if (res.data && res.data.data) {
      return res.data.data
    } else if (res.data) {
      return res.data
    } else {
      return null
    }
  } catch (error) {
    console.error(`Error al obtener categoría ID ${id}:`, error)
    if (error.response?.data?.mensaje) {
      error.message = error.response.data.mensaje
    }
    throw error
  }
}

// ✅ Actualizar categoría por ID (PUT)
export const updateCategoria = async (id, categoryData) => {
  try {
    console.log(`Actualizando categoría ID ${id}:`, categoryData)

    // Asegurarse de que el estado sea un booleano si el backend lo espera así
    if (typeof categoryData.estado === "string") {
      categoryData.estado = categoryData.estado === "activo"
    }

    const res = await axiosInstance.put(`/categoria/${id}`, categoryData)

    // Depurar la estructura de la respuesta
    console.log(`Respuesta de actualización de categoría ID ${id}:`, res.data)

    if (res.data && res.data.data) {
      return res.data.data
    } else if (res.data) {
      return res.data
    } else {
      return {}
    }
  } catch (error) {
    console.error(`Error al actualizar categoría ID ${id}:`, error)
    if (error.response?.data?.mensaje) {
      error.message = error.response.data.mensaje
    }
    throw error
  }
}

// ✅ Eliminar categoría por ID (DELETE)
export const deleteCategoria = async (id) => {
  try {
    console.log(`Eliminando categoría con ID: ${id}`)
    const res = await axiosInstance.delete(`/categoria/${id}`)
    console.log("Categoría eliminada:", res.data)
    return res.data
  } catch (error) {
    console.error(`Error al eliminar categoría ID ${id}:`, error)
    if (error.response?.data?.mensaje) {
      error.message = error.response.data.mensaje
    }
    throw error
  }
}

// ✅ Cambiar estado de la categoría (PATCH)
export const toggleCategoriaEstado = async (id, estadoActual) => {
  try {
    console.log(`Cambiando estado de categoría ID ${id} de ${estadoActual} a ${!estadoActual}`)

    // Intentar con PATCH primero (más RESTful)
    try {
      const res = await axiosInstance.patch(`/categoria/${id}/estado`, {
        estado: !estadoActual,
      })
      return logResponse("Cambiar estado (PATCH)", res.data)
    } catch (patchError) {
      // Si PATCH falla, intentar con PUT (como fallback)
      console.log("PATCH falló, intentando con PUT:", patchError.message)
      const res = await axiosInstance.put(`/categoria/${id}`, {
        estado: !estadoActual,
      })
      return logResponse("Cambiar estado (PUT fallback)", res.data)
    }
  } catch (error) {
    console.error(`Error al cambiar estado de categoría ID ${id}:`, error)
    if (error.response?.data?.mensaje) {
      error.message = error.response.data.mensaje
    }
    throw error
  }
}

