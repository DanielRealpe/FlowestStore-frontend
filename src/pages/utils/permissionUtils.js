/**
 * Utilidades para manejar permisos y estados de elementos
 */

/**
 * Verifica si un elemento está activo y si el usuario tiene permiso para interactuar con él
 * @param {Object} item - El elemento a verificar
 * @param {string} estado - El estado actual del elemento ('activo', 'inactivo', etc.)
 * @returns {boolean} - True si el elemento está activo y el usuario tiene permiso
 */
export const canInteractWithItem = (item, estado) => {
  // Si el elemento está inactivo, no se puede interactuar con él
  if (estado === "inactivo") {
    return false
  }

  return true
}

/**
 * Verifica si el usuario actual es administrador
 * @returns {boolean} - True si el usuario es administrador
 */
export const isAdmin = () => {
  try {
    const userData = JSON.parse(localStorage.getItem("user") || "{}")
    return userData.id_rol === 1
  } catch (error) {
    console.error("Error al verificar si el usuario es administrador:", error)
    return false
  }
}

/**
 * Verifica si el usuario puede cambiar el estado de un elemento
 * @returns {boolean} - True si el usuario puede cambiar el estado
 */
export const canChangeState = () => {
  return isAdmin()
}

/**
 * Verifica si el usuario puede ver todos los datos o solo los suyos
 * @param {string} module - El módulo que se está consultando
 * @returns {boolean} - True si el usuario puede ver todos los datos
 */
export const canViewAllData = (module) => {
  return isAdmin()
}

/**
 * Obtiene el ID del usuario actual
 * @returns {number|null} - El ID del usuario o null si no está disponible
 */
export const getCurrentUserId = () => {
  try {
    const userData = JSON.parse(localStorage.getItem("user") || "{}")
    return userData.id || null
  } catch (error) {
    console.error("Error al obtener el ID del usuario:", error)
    return null
  }
}
