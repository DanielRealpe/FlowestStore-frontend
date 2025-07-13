"use client"

import { useAuth } from "../../pages/usuarios/context/AuthContext"
import { Plus } from "lucide-react"

/**
 * Botón de creación que verifica permisos de creación
 * @param {Function} onClick - Función a ejecutar al hacer clic
 * @param {string} recurso - Recurso a crear (ej: "productos")
 * @param {string} className - Clases CSS adicionales
 * @param {boolean} disabled - Si el botón está deshabilitado por otras razones
 */
const CreateButton = ({ onClick, recurso, className = "", disabled = false, children, ...props }) => {
  const { user, hasPermission } = useAuth()

  // Verificar si puede crear
  const canCreate = user && (user.id_rol === 1 || hasPermission(recurso, "crear"))
  const isDisabled = disabled || !canCreate

  // Clases para botón deshabilitado
  const disabledClasses = isDisabled ? "opacity-50 cursor-not-allowed" : ""

  return (
    <button
      onClick={canCreate ? onClick : undefined}
      className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 ${className} ${disabledClasses}`}
      disabled={isDisabled}
      title={!canCreate ? "No tienes permisos para crear" : "Crear nuevo"}
      {...props}
    >
      <Plus size={18} />
      {children || "Crear nuevo"}
    </button>
  )
}

export default CreateButton
