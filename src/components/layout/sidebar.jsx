"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../pages/usuarios/context/AuthContext"
import { useSidebar } from "./sidebarUtils"
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
  Box as BoxIcon,
} from "lucide-react"

const Sidebar = () => {
  const { isExpanded, toggleSidebar } = useSidebar()
  const { 
    user, 
    signout, 
    isAuthenticated, 
    loadUserPermissions, 
    isLoadingAuth,
    hasPermission  // Añadir hasPermission aquí
  } = useAuth()
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  // Usar una referencia para evitar múltiples cargas de permisos
  const permisosLoaded = useRef(false)

  // Definición de módulos con sus iconos y rutas
  const modulos = [
    {
      id: "dashboard",
      nombre: "Dashboard",
      icono: LayoutDashboard,
      ruta: "/dashboard",
      permiso: "dashboard.ver",
    },
    {
      id: "clientes",
      nombre: "Clientes",
      icono: ShoppingBag,
      ruta: "/clientes",
      permiso: "clientes.ver",
    },
    {
      id: "pedidos",
      nombre: "Pedidos",
      icono: FileText,
      ruta: "/pedidos",
      permiso: "pedidos.ver",
    },
    {
      id: "usuarios",
      nombre: "Usuarios",
      icono: Users,
      ruta: "/usuario",
      permiso: "usuarios.ver",
      soloAdmin: true, // Solo visible para administradores
    },
    {
      id: "categorias",
      nombre: "Categorías",
      icono: Tag,
      ruta: "/categoria",
      permiso: "categorias.ver",
    },
    {
      id: "productos",
      nombre: "Productos",
      icono: Package,
      ruta: "/productos",
      permiso: "productos.ver",
    },
    {
      id: "inventory",
      nombre: "Inventario",
      icono: BoxIcon,
      ruta: "/inventory",
      permiso: "inventario.ver",
    },
    {
      id: "ventas",
      nombre: "Ventas",
      icono: DollarSign,
      ruta: "/ventas",
      permiso: "ventas.ver",
    },
    {
      id: "configuracion",
      nombre: "Configuración",
      icono: Settings,
      ruta: "/configuracion",
      permiso: "configuracion.ver",
      soloAdmin: true, // Solo visible para administradores
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

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-900 text-white transition-all duration-300 z-20 ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        <h1 className={`font-bold text-xl ${!isExpanded && "hidden"}`}>Sistema</h1>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          title={isExpanded ? "Contraer menú" : "Expandir menú"}
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="py-4">
        <ul className="space-y-2 px-2">
          {loading
            ? // Mostrar esqueletos de carga mientras se cargan los permisos
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <li key={index} className="px-2 py-3">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gray-700 rounded-md animate-pulse"></div>
                      {isExpanded && <div className="ml-3 h-4 w-24 bg-gray-700 rounded animate-pulse"></div>}
                    </div>
                  </li>
                ))
            : // Mostrar módulos visibles
              modulosVisibles.map((modulo) => {
                const isActive = location.pathname === modulo.ruta
                const IconComponent = modulo.icono

                return (
                  <li key={modulo.id}>
                    <Link
                      to={modulo.ruta}
                      className={`flex items-center px-2 py-3 rounded-lg transition-colors ${
                        isActive ? "bg-orange-500 text-white" : "hover:bg-gray-800 text-gray-300 hover:text-white"
                      }`}
                    >
                      <IconComponent size={20} className="min-w-[20px]" />
                      {isExpanded && <span className="ml-3">{modulo.nombre}</span>}
                    </Link>
                  </li>
                )
              })}
        </ul>
      </div>

      {/* Botón de cerrar sesión en la parte inferior */}
      <div className="absolute bottom-0 w-full border-t border-gray-800 p-4">
        <button
          onClick={signout}
          className="flex items-center w-full px-2 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          {isExpanded && <span className="ml-3">Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
