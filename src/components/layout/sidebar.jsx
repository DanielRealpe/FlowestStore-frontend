"use client"

import { useState, useEffect, useRef } from "react"
// import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../pages/usuarios/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useSidebar } from "./sidebarUtils"
import { useTheme } from "./ThemeContext"
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Tag,
  Package,
  DollarSign,
  FileText,
  Settings,
  Menu,
  LogOut,
  Box,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const Sidebar = () => {
  const { isExpanded, toggleExpand } = useSidebar()
  const {
    user,
    signout,
    isAuthenticated,
    loadUserPermissions,
    isLoadingAuth,
    hasPermission  // Añadir hasPermission aquí
  } = useAuth()
  const [loading, setLoading] = useState(true)
  const [currentPath, setCurrentPath] = useState("/dashboard") // Simular location.pathname
  const { darkMode } = useTheme()

  // Usar una referencia para evitar múltiples cargas de permisos
  const permisosLoaded = useRef(false)

  const navigate = useNavigate()

  // Definición de módulos con sus iconos y rutas
  const modulos = [
    {
      id: "dashboard",
      nombre: "Dashboard",
      icono: LayoutDashboard,
      ruta: "/dashboard",
      permiso: "dashboard.ver",
      descripcion: "Vista general del sistema"
    },
    {
      id: "clientes",
      nombre: "Clientes",
      icono: ShoppingBag,
      ruta: "/clientes",
      permiso: "clientes.ver",
      descripcion: "Gestión de clientes"
    },
    {
      id: "pedidos",
      nombre: "Pedidos",
      icono: FileText,
      ruta: "/pedidos",
      permiso: "pedidos.ver",
      descripcion: "Administrar pedidos"
    },
    {
      id: "usuarios",
      nombre: "Usuarios",
      icono: Users,
      ruta: "/usuario",
      permiso: "usuarios.ver",
      soloAdmin: true, // Solo visible para administradores
      descripcion: "Gestión de usuarios del sistema"
    },
    {
      id: "categorias",
      nombre: "Categorías",
      icono: Tag,
      ruta: "/categoria",
      permiso: "categorias.ver",
      descripcion: "Categorías de productos"
    },
    {
      id: "productos",
      nombre: "Productos",
      icono: Package,
      ruta: "/productos",
      permiso: "productos.ver",
      descripcion: "Catálogo de productos"
    },
    {
      id: "ventas",
      nombre: "Ventas",
      icono: DollarSign,
      ruta: "/ventas",
      permiso: "ventas.ver",
      descripcion: "Reportes de ventas"
    },
    {
      id: "configuracion",
      nombre: "Configuración",
      icono: Settings,
      ruta: "/configuracion",
      permiso: "configuracion.ver",
      soloAdmin: true, // Solo visible para administradores
      descripcion: "Configuración del sistema"
    },
  ]

  useEffect(() => {
    const cargarPermisos = async () => {
      // Solo cargar permisos si el usuario está autenticado y la autenticación ha terminado de cargar
      if (!isAuthenticated || isLoadingAuth) {
        console.log("Sidebar: Esperando autenticación para cargar permisos")
        setLoading(false)
        return
      }

      // Evitar cargar permisos múltiples veces
      if (permisosLoaded.current) {
        console.log("Sidebar: Permisos ya cargados, evitando carga duplicada")
        setLoading(false)
        return
      }

      try {
        console.log("Sidebar: Iniciando carga de permisos para el usuario autenticado")
        setLoading(true)
        await loadUserPermissions()
        console.log("Sidebar: Permisos cargados exitosamente")

        // Marcar que los permisos ya se cargaron
        permisosLoaded.current = true
      } catch (error) {
        console.error("Sidebar: Error al cargar permisos:", error)
      } finally {
        setLoading(false)
      }
    }

    // Solo intentar cargar permisos cuando la autenticación ha terminado
    if (!isLoadingAuth) {
      cargarPermisos()
    }

    // Limpiar el estado cuando el componente se desmonta
    return () => {
      permisosLoaded.current = false
    }
  }, [isAuthenticated, isLoadingAuth, loadUserPermissions])

  // Nueva lógica de filtrado: mostrar todos los módulos excepto los marcados como soloAdmin
  const modulosVisibles = modulos.filter((modulo) => {
    // Si el usuario es administrador (rol 1), mostrar todos los módulos
    if (user?.id_rol === 1) return true;

    // Si el módulo es solo para admin y el usuario no es admin, no mostrarlo
    if (modulo.soloAdmin && user?.id_rol !== 1) return false;

    // Verificar si tiene el permiso específico para el módulo
    const [recurso, accion] = modulo.permiso.split('.');
    return hasPermission(recurso, accion);
  })

  const handleNavigation = (ruta) => {
    setCurrentPath(ruta)
    navigate(ruta) // Usar navigate de react-router-dom para cambiar la ruta
    console.log("Navegando a:", ruta)
  }

  return (
    <div
      className={`fixed top-0 left-0 h-full transition-all duration-300 z-20 ${isExpanded ? "w-64" : "w-20"} ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-lg`}
    >
      {/* Header del sidebar */}
      <div className={`flex items-center justify-between h-16 px-4 border-b ${darkMode ? 'border-gray-700 bg-gradient-to-r from-indigo-800 to-purple-900' : 'border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50'}`}>
        {isExpanded && (
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gradient-to-r from-indigo-300 to-purple-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <div>
              <h1 className={`font-bold text-lg bg-clip-text text-transparent ${darkMode ? 'bg-gradient-to-r from-indigo-300 to-purple-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
                Flowest
              </h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Admin Panel</p>
            </div>
          </div>
        )}
        <button
          onClick={toggleExpand}
          className={`p-2 rounded-lg transition-colors group ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-white/80'}`}
          title={isExpanded ? "Contraer menú" : "Expandir menú"}
        >
          {isExpanded ? (
            <ChevronLeft className={`w-5 h-5 transition-colors group-hover:text-indigo-600 ${darkMode ? 'text-white' : 'text-slate-600'}`} />
          ) : (
            <ChevronRight className={`w-5 h-5 transition-colors group-hover:text-indigo-600 ${darkMode ? 'text-white' : 'text-slate-600'}`} />
          )}
        </button>
      </div>

      {/* Menú de navegación */}
      <div className="py-4 flex-1 overflow-y-auto">
        <nav className="space-y-1 px-3">
          {loading
            ? // Mostrar esqueletos de carga mientras se cargan los permisos
            Array(6)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="px-3 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-slate-200 rounded animate-pulse"></div>
                    {isExpanded && (
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            : // Mostrar módulos visibles
            modulosVisibles.map((modulo) => {
              const isActive = currentPath === modulo.ruta
              const IconComponent = modulo.icono

              return (
                <button
                  key={modulo.id}
                  onClick={() => handleNavigation(modulo.ruta)}
                  className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                      : `hover:bg-slate-100 ${darkMode ? 'text-gray-300 hover:text-indigo-300' : 'text-slate-700 hover:text-indigo-600'}`
                    }`}
                  title={!isExpanded ? modulo.nombre : undefined}
                >
                  <IconComponent
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? "text-white" : `${darkMode ? 'text-gray-400 group-hover:text-indigo-300' : 'text-slate-500 group-hover:text-indigo-600'}`
                      }`}
                  />
                  {isExpanded && (
                    <div className="ml-3 flex-1 text-left">
                      <span className="font-medium text-sm block">{modulo.nombre}</span>
                      <span className={`text-xs opacity-75 ${isActive ? "text-indigo-100" : `${darkMode ? 'text-gray-500' : 'text-slate-500'}`
                        }`}>
                        {modulo.descripcion}
                      </span>
                    </div>
                  )}

                  {/* Indicador activo */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                  )}

                  {/* Tooltip para modo contraído */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      <div className="font-medium">{modulo.nombre}</div>
                      <div className="text-xs opacity-75">{modulo.descripcion}</div>
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45"></div>
                    </div>
                  )}
                </button>
              )
            })}
        </nav>
      </div>

      {/* Botón de cerrar sesión en la parte inferior */}
      <div className={`border-t p-3 ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
        <button
          onClick={signout}
          className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${darkMode ? 'hover:bg-red-900 text-gray-300 hover:text-red-300' : 'hover:bg-red-50 text-slate-700 hover:text-red-600'}`}
          title={!isExpanded ? "Cerrar sesión" : undefined}
        >
          <LogOut className={`w-5 h-5 flex-shrink-0 transition-colors group-hover:text-red-600 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`} />
          {isExpanded && (
            <div className="ml-3 flex-1 text-left">
              <span className="font-medium text-sm">Cerrar sesión</span>
              <span className="text-xs text-slate-500 block">Salir del sistema</span>
            </div>
          )}

          {/* Tooltip para modo contraído */}
          {!isExpanded && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
              <div className="font-medium">Cerrar sesión</div>
              <div className="text-xs opacity-75">Salir del sistema</div>
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45"></div>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

export default Sidebar