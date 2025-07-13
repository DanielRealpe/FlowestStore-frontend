"use client"

import { useAuth } from "../../pages/usuarios/context/AuthContext"

/**
 * Componente para mostrar/ocultar elementos basados en permisos
 * @param {React.ReactNode} children - Contenido a mostrar si tiene permisos
 * @param {string} requiredPermission - Permiso requerido en formato "recurso.accion"
 * @param {number} requiredRole - ID del rol requerido (ej: 1 para admin)
 * @param {React.ReactNode} fallback - Contenido a mostrar si no tiene permisos
 */
const PermissionGuard = ({ children, requiredPermission, requiredRole, fallback = null }) => {
  const { user, hasPermission, hasRole } = useAuth()

  // Si no hay usuario autenticado, mostrar fallback
  if (!user) return fallback

  // Si se requiere un rol específico y el usuario no lo tiene
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback
  }

  // Si se requiere un permiso específico
  if (requiredPermission) {
    const [recurso, accion] = requiredPermission.split(".")

    // Verificar si el usuario es admin o tiene el permiso específico
    const tienePermiso = user.id_rol === 1 || hasPermission(recurso, accion)

    if (!tienePermiso) {
      return fallback
    }
  }

  // Si pasa todas las verificaciones, mostrar el contenido
  return children
}

export default PermissionGuard
