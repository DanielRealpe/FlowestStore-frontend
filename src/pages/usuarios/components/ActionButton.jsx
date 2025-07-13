"use client"

import { useAuth } from "../../pages/usuarios/context/AuthContext"

/**
 * Botón que se habilita/deshabilita según los permisos del usuario
 * @param {React.ReactNode} children - Contenido del botón
 * @param {Function} onClick - Función a ejecutar al hacer clic
 * @param {string} requiredPermission - Permiso requerido en formato "recurso.accion"
 * @param {number} requiredRole - ID del rol requerido (ej: 1 para admin)
 * @param {string} className - Clases CSS adicionales
 * @param {boolean} disabled - Si el botón está deshabilitado por otras razones
 */
const ActionButton = ({
  children,
  onClick,
  requiredPermission,
  requiredRole,
  className = "",
  disabled = false,
  ...props
}) => {
  const { user, hasPermission, hasRole } = useAuth()

  // Verificar permisos
  let hasAccess = true

  // Si no hay usuario, no tiene acceso
  if (!user) {
    hasAccess = false
  }
  // Verificar rol si es requerido
  else if (requiredRole && !hasRole(requiredRole)) {
    hasAccess = false
  }
  // Verificar permiso específico si es requerido
  else if (requiredPermission) {
    const [recurso, accion] = requiredPermission.split(".")

    // Verificar si el usuario es admin o tiene el permiso específico
    hasAccess = user.id_rol === 1 || hasPermission(recurso, accion)
  }

  // Si no tiene acceso, deshabilitar el botón
  const isDisabled = disabled || !hasAccess

  // Clases para botón deshabilitado
  const disabledClasses = isDisabled ? "opacity-50 cursor-not-allowed" : ""

  return (
    <button
      onClick={hasAccess ? onClick : undefined}
      className={`${className} ${disabledClasses}`}
      disabled={isDisabled}
      title={!hasAccess ? "No tienes permisos para esta acción" : ""}
      {...props}
    >
      {children}
    </button>
  )
}

export default ActionButton
