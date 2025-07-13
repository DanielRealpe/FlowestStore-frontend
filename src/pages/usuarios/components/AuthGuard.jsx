"use client"
import { useAuth } from "../../pages/usuarios/context/AuthContext"
import { Navigate } from "react-router-dom"

/**
 * Componente para proteger rutas basado en roles
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si el usuario tiene acceso
 * @param {Array<number>} props.allowedRoles - IDs de roles permitidos para acceder a esta ruta
 * @param {string} props.redirectTo - Ruta a la que redirigir si no tiene acceso
 */
const AuthGuard = ({ children, allowedRoles = [], redirectTo = "/login" }) => {
  const { user, isAuthenticated, loading } = useAuth()

  // Si está cargando, mostrar un indicador de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // Si no se especifican roles permitidos, permitir acceso a cualquier usuario autenticado
  if (!allowedRoles.length) {
    return children
  }

  // Verificar si el usuario tiene un rol permitido
  if (user && allowedRoles.includes(user.id_rol)) {
    return children
  }

  // Si el usuario no tiene un rol permitido, redirigir a una página de acceso denegado
  return <Navigate to="/acceso-denegado" replace />
}

export default AuthGuard
