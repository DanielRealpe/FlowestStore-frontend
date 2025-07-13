"use client"

import { useAuth } from "../../pages/usuarios/context/AuthContext"
import { Edit } from "lucide-react"

/**
 * Botón de edición que verifica permisos de edición
 * @param {Function} onClick - Función a ejecutar al hacer clic
 * @param {string} recurso - Recurso a editar (ej: "productos")
 * @param {string} className - Clases CSS adicionales
 * @param {boolean} disabled - Si el botón está deshabilitado por otras razones
 */
const EditButton = ({ onClick, recurso, className = "", disabled = false, ...props }) => {
  const { user, hasPermission } = useAuth()

  // Verificar si puede editar
  const canEdit = user && (user.id_rol === 1 || hasPermission(recurso, "editar"))
  const isDisabled = disabled || !canEdit

  // Clases para botón deshabilitado
  const disabledClasses = isDisabled ? "opacity-50 cursor-not-allowed" : ""

  return (
    <button
      onClick={canEdit ? onClick : undefined}
      className={`bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg ${className} ${disabledClasses}`}
      disabled={isDisabled}
      title={!canEdit ? "No tienes permisos para editar" : "Editar"}
      {...props}
    >
      <Edit size={18} />
    </button>
  )
}

export default EditButton
