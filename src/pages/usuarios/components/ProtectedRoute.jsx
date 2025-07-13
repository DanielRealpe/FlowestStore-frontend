"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { AlertTriangle, ShieldOff } from "lucide-react"

const ProtectedRoute = ({ children, requiredPermission, requiredRole }) => {
  const { user, isAuthenticated, isLoadingAuth, hasRole, hasPermission, navigateTo } = useAuth()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const verificarAcceso = async () => {
      if (isLoadingAuth) return

      if (!isAuthenticated) {
        navigateTo("/login")
        return
      }

      try {
        setLoading(true)
        let hasAccess = true

        // Si el usuario es admin, tiene acceso a todo
        if (user?.id_rol === 1) {
          setAuthorized(true)
          setLoading(false)
          return
        }

        // Verificar rol si es requerido
        if (requiredRole && !hasRole(requiredRole)) {
          console.log(`Acceso denegado: Se requiere rol ${requiredRole}`)
          hasAccess = false
        }

        // Verificar permiso específico si es requerido
        if (requiredPermission && hasAccess) {
          const [recurso, accion] = requiredPermission.split(".")
          const tienePermiso = hasPermission(recurso, accion)

          if (!tienePermiso) {
            console.log(`Acceso denegado: Se requiere permiso ${requiredPermission}`)
            hasAccess = false
          }
        }

        setAuthorized(hasAccess)

        if (!hasAccess) {
          navigateTo("/welcome")
        }
      } catch (err) {
        console.error("Error al verificar permisos:", err)
        setError("Error al verificar permisos de acceso")
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    verificarAcceso()
  }, [isLoadingAuth, isAuthenticated, user, requiredPermission, requiredRole])

  // Mostrar spinner mientras se verifica la autenticación
  if (isLoadingAuth || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // Mostrar mensaje de error si ocurrió alguno
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-4">
        <div className="bg-red-900/50 text-white p-6 rounded-lg border border-red-700 max-w-md">
          <div className="flex items-center mb-4">
            <AlertTriangle className="text-red-400 mr-3 h-8 w-8" />
            <h2 className="text-xl font-bold">Error de Acceso</h2>
          </div>
          <p>{error}</p>
          <button
            onClick={() => navigateTo("/welcome")}
            className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg w-full"
          >
            Ir a Inicio
          </button>
        </div>
      </div>
    )
  }

  // Si no está autorizado, mostrar página de acceso denegado
  if (!authorized) {
    verificarAcceso()
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-4">
        <div className="bg-orange-900/30 text-white p-6 rounded-lg border border-orange-700 max-w-md">
          <div className="flex items-center mb-4">
            <ShieldOff className="text-orange-400 mr-3 h-8 w-8" />
            <h2 className="text-xl font-bold">Acceso Denegado</h2>
          </div>
          <p>No tienes los permisos necesarios para acceder a esta sección.</p>
          <button
            onClick={() => navigateTo("/welcome")}
            className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg w-full"
          >
            Ir a Inicio
          </button>
        </div>
      </div>
    )
  }

  // Si está autorizado, mostrar los children
  return children
}

export default ProtectedRoute
