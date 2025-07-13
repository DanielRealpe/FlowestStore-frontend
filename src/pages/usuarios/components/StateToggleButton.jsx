"use client"
import { canChangeState } from "../utils/permissionUtils"

/**
 * Botón para cambiar el estado de un elemento
 * Solo visible y funcional para administradores
 */
const StateToggleButton = ({ id, currentState, onToggle, itemType }) => {
  const isAdmin = canChangeState()

  // Si no es administrador, no mostrar el botón
  if (!isAdmin) {
    return null
  }

  const handleClick = async () => {
    try {
      await onToggle(id, currentState)
    } catch (error) {
      console.error(`Error al cambiar estado del ${itemType}:`, error)
      alert(error.message || `No se pudo cambiar el estado del ${itemType}`)
    }
  }

  const buttonClass =
    currentState === "activo" ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"

  return (
    <button onClick={handleClick} className={`px-3 py-1 rounded-md text-sm font-medium ${buttonClass}`}>
      {currentState === "activo" ? "Activo" : "Inactivo"}
    </button>
  )
}

export default StateToggleButton
