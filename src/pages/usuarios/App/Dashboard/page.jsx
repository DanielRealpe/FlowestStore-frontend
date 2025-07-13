"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import ModuleAccess from "../../components/ModuleAccess"
import { Shield, User, Calendar, Clock } from "lucide-react"

export default function Dashboard() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth()
  const [fecha, setFecha] = useState("")
  const [hora, setHora] = useState("")

  useEffect(() => {
    // Actualizar fecha y hora
    const actualizarFechaHora = () => {
      const ahora = new Date()

      // Formatear fecha: "Lunes, 6 de Mayo de 2024"
      const opciones = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
      setFecha(ahora.toLocaleDateString("es-ES", opciones))

      // Formatear hora: "14:30:45"
      setHora(ahora.toLocaleTimeString("es-ES"))
    }

    actualizarFechaHora()
    const intervalo = setInterval(actualizarFechaHora, 1000)

    return () => clearInterval(intervalo)
  }, [])

  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // El ProtectedRoute se encargará de redirigir
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Encabezado */}
        <header className="mb-8 bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl border-l-4 border-orange-500 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Bienvenido, {user?.nombre}</h1>
              <p className="text-gray-400 mt-2">Panel de Control</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-end">
              <div className="flex items-center text-orange-300 mb-1">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm capitalize">{fecha}</span>
              </div>
              <div className="flex items-center text-orange-300">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm">{hora}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Información del usuario */}
        <div className="mb-8 bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="bg-gray-700 p-4 rounded-full">
              <User className="h-16 w-16 text-orange-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user?.nombre}</h2>
              <p className="text-gray-400">{user?.email}</p>
              <div className="mt-2 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-orange-400" />
                <span className="bg-orange-900/50 text-orange-300 px-3 py-1 rounded-full text-xs">
                  {user?.id_rol === 1 ? "Administrador" : user?.id_rol === 2 ? "Empleado" : "Usuario"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Título de módulos */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Módulos del Sistema</h2>
          <p className="text-gray-400">Accede a los módulos según tus permisos</p>
        </div>

        {/* Módulos con control de acceso */}
        <ModuleAccess />
      </div>
    </div>
  )
}
