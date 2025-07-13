"use client"

import { useState } from "react"
import { SidebarProvider } from "./sidebarContext"
import Navbar from "./navbar"
import Sidebar from "./sidebar"

export default function ClientLayout({ children }) {
  const [currentPath, setCurrentPath] = useState("/dashboard")

  // Datos de ejemplo - reemplaza con tu lógica de autenticación
  const user = {
    id: 1,
    nombre: "Juan Pérez",
    email: "juan@ejemplo.com",
    cedula: "12345678",
    estado: "activo",
    id_rol: 1,
    rol: {
      id: 1,
      nombre: "Administrador",
    },
  }

  const handleLogout = async () => {
    console.log("Cerrando sesión...")
  }

  const handleNavigateToProfile = () => {
    setCurrentPath("/perfil")
  }

  const handleNavigate = (path) => {
    setCurrentPath(path)
  }

  const loadUserPermissions = async () => {
    console.log("Cargando permisos...")
  }

  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar
              user={user}
              isAuthenticated={true}
              isLoadingAuth={false}
              onLogout={handleLogout}
              loadUserPermissions={loadUserPermissions}
              currentPath={currentPath}
              onNavigate={handleNavigate}
            />
            <div className="flex-1 transition-all duration-300 ml-64 sidebar-expanded:ml-64 sidebar-collapsed:ml-20">
              <Navbar user={user} onLogout={handleLogout} onNavigateToProfile={handleNavigateToProfile} />
              <main className="pt-16 p-6">
                <div className="max-w-7xl mx-auto">{children}</div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}
