"use client"

import { useAuth } from "../../pages/usuarios/context/AuthContext"
import { Trash2 } from "lucide-react"

/**
 * Botón de eliminación que solo está disponible para administradores
 * @param {Function} onClick - Función a ejecutar al hacer clic
 * @param {string} className - Clases CSS adicionales
 * @param {boolean} disabled - Si el botón está deshabilitado por otras razones
 */
const DeleteButton = ({ onClick, className = "", disabled = false, ...props }) => {
  const { user } = useAuth()

  // Solo administradores pueden eliminar
  const isAdmin = user && user.id_rol === 1
  const isDisabled = disabled || !isAdmin

  // Clases para botón deshabilitado
  const disabledClasses = isDisabled ? "opacity-50 cursor-not-allowed" : ""

  return (
    <button
      onClick={isAdmin ? onClick : undefined}
      className={`bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg ${className} ${disabledClasses}`}
      disabled={isDisabled}
      title={!isAdmin ? "Solo administradores pueden eliminar" : "Eliminar"}
      {...props}
    >
      <Trash2 size={18} />
    </button>
  )
}

export default DeleteButton
