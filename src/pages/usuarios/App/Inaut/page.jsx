"use client"

import { useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { ShieldOff, Home, LogOut } from "lucide-react"

export default function Unauthorized() {
  const { isAuthenticated, signout, navigateTo } = useAuth()

  useEffect(() => {
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      navigateTo("/login")
    }
  }, [isAuthenticated, navigateTo])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 bg-orange-600">
          <div className="flex justify-center">
            <div className="bg-white/20 p-4 rounded-full">
              <ShieldOff className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-bold text-white text-center mb-2">Acceso Denegado</h1>
          <p className="text-gray-400 text-center mb-6">
            No tienes los permisos necesarios para acceder a esta sección del sistema.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigateTo("/dashboard")}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
            >
              <Home className="mr-2 h-5 w-5" />
              Volver al Dashboard
            </button>

            <button
              onClick={signout}
              className="w-full bg-red-900/50 hover:bg-red-900 text-white py-2 px-4 rounded-lg flex items-center justify-center"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
