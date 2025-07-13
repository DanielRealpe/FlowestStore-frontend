"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"

import Sidebar from "./components/layout/sidebar"
import Navbar from "./components/layout/navbar"
import Cliente from "./pages/clientes/cliente"
import Pedido from "./pages/pedidos/pedido"
import Categoria from "./pages/categorias/categoria"
import Productos from "./pages/productos/productos"
import Usuario from "./pages/usuarios/usuario"
import Venta from "./pages/ventas/venta"
import Configuracion from "./pages/configuracion/configuracion"
import Dashboard from "./pages/dashboard/dashboard"
import { SidebarProvider } from "./components/layout/sidebarContext"
import LoginPage from "./pages/usuarios/Login"
import { useSidebar } from "./components/layout/sidebarUtils"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import "./App.css"
import { AuthProvider, useAuth } from "./pages/usuarios/context/AuthContext"
import "./App.css"
import ProtectedRoute from "./pages/usuarios/components/ProtectedRoute"
import Inventory from "./pages/inventory/inventory"
import Welcome from "./pages/welcome/welcome"

// Componente para proteger rutas
const ProtectedRouteWrapper = ({ children, requiredPermission, requiredRole }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Solo actualizar el estado cuando la carga de autenticación ha terminado
    if (!isLoadingAuth) {
      setInitialized(true)
    }
  }, [isLoadingAuth])

  // No renderizar nada hasta que la autenticación haya terminado de cargar
  if (!initialized) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <ProtectedRoute requiredPermission={requiredPermission} requiredRole={requiredRole}>
      {children}
    </ProtectedRoute>
  )
}

export function App() {
  return (
    <Router>
      <AuthProvider>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </AuthProvider>
    </Router>
  )
}

function AppContent() {
  const { isExpanded } = useSidebar()
  const { isAuthenticated, isLoadingAuth } = useAuth()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Solo actualizar el estado cuando la carga de autenticación ha terminado
    if (!isLoadingAuth) {
      setInitialized(true)
    }
  }, [isLoadingAuth])

  // No renderizar nada hasta que la autenticación haya terminado de cargar
  if (!initialized) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  return (
    <div className="flex h-screen">
      {isAuthenticated && <Sidebar />}
      <main
        className={`flex-1 ${isAuthenticated ? (isExpanded ? "ml-64" : "ml-20") : ""} overflow-y-auto transition-all duration-300`}
      >
        {isAuthenticated && <Navbar />}
        <div className={`${isAuthenticated ? "p-4 pt-20" : ""}`}>
          <Routes>
            {/* Redirigir "/" a login o dashboard según autenticación */}
            <Route
              path="/"
              element={isAuthenticated ? <Navigate to="/welcome" replace /> : <Navigate to="/login" replace />}
            />

            {/* Página de Login */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/welcome" replace /> : <LoginPage />} />

            {/* Rutas protegidas del sistema */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRouteWrapper requiredPermission="dashboard.ver">
                  <Dashboard />
                </ProtectedRouteWrapper>
              }
            />
            <Route
              path="/clientes"
              element={
                <ProtectedRouteWrapper requiredPermission="clientes.ver">
                  <Cliente />
                </ProtectedRouteWrapper>
              }
            />
            <Route
              path="/pedidos"
              element={
                <ProtectedRouteWrapper requiredPermission="pedidos.ver">
                  <Pedido />
                </ProtectedRouteWrapper>
              }
            />
            <Route
              path="/usuario"
              element={
                <ProtectedRouteWrapper requiredRole={1}>
                  <Usuario />
                </ProtectedRouteWrapper>
              }
            />
            <Route
              path="/categoria"
              element={
                <ProtectedRouteWrapper requiredPermission="categorias.ver">
                  <Categoria />
                </ProtectedRouteWrapper>
              }
            />
            <Route
              path="/productos"
              element={
                <ProtectedRouteWrapper requiredPermission="productos.ver">
                  <Productos />
                </ProtectedRouteWrapper>
              }
            />
            <Route
              path="/ventas"
              element={
                <ProtectedRouteWrapper requiredPermission="ventas.ver">
                  <Venta />
                </ProtectedRouteWrapper>
              }
            />
            <Route
              path="/configuracion"
              element={
                <ProtectedRouteWrapper requiredRole={1}>
                  <Configuracion />
                </ProtectedRouteWrapper>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRouteWrapper requiredPermission="inventario.ver">
                  <Inventory />
                </ProtectedRouteWrapper>
              }
            />
            <Route
              path="/welcome"
              element={
                <ProtectedRouteWrapper>
                  <Welcome />
                </ProtectedRouteWrapper>
              }
            />

            {/* Ruta para manejar páginas no encontradas */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>

        {/* 🔔 Contenedor global para notificaciones */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
        />
      </main>
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-xl text-gray-600">Página no encontrada</p>
      </div>
    </div>
  )
}

export default App
