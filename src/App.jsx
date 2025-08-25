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
import { Home } from "./pages/home/home"
import { SidebarProvider } from "./components/layout/sidebarContext"
import LoginPage from "./pages/usuarios/Login"
import { useSidebar } from "./components/layout/sidebarUtils"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import RegisterForm from "./pages/usuarios/components/RegisterForm"

import "./App.css"
import { AuthProvider, useAuth } from "./pages/usuarios/context/AuthContext"
import "./App.css"
import ProtectedRoute from "./pages/usuarios/components/ProtectedRoute"
import Inventory from "./pages/inventory/inventory"
import Welcome from "./pages/welcome/welcome"
import { ThemeProvider, useTheme } from "./components/layout/ThemeContext.jsx"
import UserProfile from "./pages/perfile/user-profile.js"
import { MisPedidos } from "./pages/home/PedidoCard.jsx"

// Componente para proteger rutas
const ProtectedRouteWrapper = ({ children, requiredPermission, requiredRole, allowedTypes = ["usuario"] }) => {
  const { isAuthenticated, isLoadingAuth, tipo } = useAuth()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!isLoadingAuth) setInitialized(true)
  }, [isLoadingAuth])

  if (!initialized) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  // Si no está autenticado o el tipo no es permitido, redirigir
  if (!isAuthenticated || !allowedTypes.includes(tipo)) {
    // Si es cliente y no tiene acceso, lo mandas a home
    if (tipo === "cliente") return <Navigate to="/" replace />
    // Si es usuario/admin y no tiene acceso, lo mandas a login
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
      <ThemeProvider>
        <AuthProvider>
          <SidebarProvider>
            <AppContent />
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

function AppContent() {
  const { isExpanded } = useSidebar()
  const { isAuthenticated, isLoadingAuth, tipo } = useAuth()
  const [initialized, setInitialized] = useState(false)
  const { darkMode } = useTheme() // Añade esta línea para usar el tema

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
      {(isAuthenticated && tipo === "usuario" && window.location.pathname !== "/") && <Sidebar />}
      <main
        className={`flex-1 ${(isAuthenticated && tipo === "usuario" && window.location.pathname !== "/")
            ? (isExpanded ? "ml-64" : "ml-20")
            : ""
          } overflow-y-auto transition-all duration-300 ${darkMode
            ? 'bg-gray-800 border-gray-700 text-white'
            : 'bg-white border-slate-200 text-slate-900'
          }`}
      >
        {(isAuthenticated && tipo === "usuario" && window.location.pathname !== "/") && <Navbar />}
        <div className={`${(isAuthenticated && tipo === "usuario" && window.location.pathname !== "/")
            ? "p-4 pt-20"
            : ""
          }`}>
          <Routes>
            {/* Página principal siempre muestra Home */}
            <Route path="/" element={<Home />} />

            {/* Página de Login */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

            {/* 👇 AÑADE LA NUEVA RUTA PROTEGIDA PARA CLIENTES */}
            <Route
              path="/mis-pedidos"
              element={
                <ProtectedRouteWrapper allowedTypes={["cliente"]}>
                  <MisPedidos />
                </ProtectedRouteWrapper>
              }
            />

            {/* Rutas protegidas del sistema */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRouteWrapper requiredPermission="dashboard.ver" allowedTypes={["usuario"]}>
                  <Dashboard />
                </ProtectedRouteWrapper>
              }
            />
            <Route
              path="/clientes"
              element={
                <ProtectedRouteWrapper requiredPermission="clientes.ver" allowedTypes={["usuario"]}>
                  <Cliente />
                </ProtectedRouteWrapper>
              }
            />
            <Route
              path="/pedidos"
              element={
                <ProtectedRouteWrapper requiredPermission="pedidos.ver " allowedTypes={["usuario"]}>
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
                <ProtectedRouteWrapper requiredPermission="categorias.ver " allowedTypes={["usuario"]}>
                  <Categoria />
                </ProtectedRouteWrapper>
              }
            />
            <Route
              path="/productos"
              element={
                <ProtectedRouteWrapper requiredPermission="productos.ver " allowedTypes={["usuario"]}>
                  <Productos />
                </ProtectedRouteWrapper>
              }
            />
            <Route
              path="/ventas"
              element={
                <ProtectedRouteWrapper requiredPermission="ventas.ver " allowedTypes={["usuario"]}>
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
              path="/perfil"
              element={
                <ProtectedRouteWrapper allowedTypes={["usuario"]}>
                  <UserProfile />
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
            <Route path="/register" element={<RegisterForm />} />

            {/* Ruta para manejar páginas no encontradas */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme={darkMode ? "dark" : "light"}
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
