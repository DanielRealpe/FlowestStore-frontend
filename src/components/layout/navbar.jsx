"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, User, LogOut, Search, Settings, Moon, Sun, ChevronDown } from "lucide-react"
import { useAuth } from "../../pages/usuarios/context/AuthContext"
import { useSidebar } from "./sidebarUtils"
import { useTheme } from "./ThemeContext";

import { useNavigate } from "react-router-dom"

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const { user, signout } = useAuth()
  const profileRef = useRef(null)
  const notificationsRef = useRef(null)

  const { isExpanded } = useSidebar()
  const { darkMode, toggleTheme } = useTheme();

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const navigate = useNavigate()

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
    setIsNotificationsOpen(false)
  }

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen)
    setIsProfileOpen(false)
  }

  const handleLogout = async () => {
    await signout()
  }

  // Notificaciones de ejemplo
  const notifications = [
    { id: 1, title: "Nuevo pedido recibido", message: "Pedido #1234 pendiente de procesamiento", time: "Hace 5 min", unread: true },
    { id: 2, title: "Stock bajo", message: "Producto XYZ tiene stock menor a 10 unidades", time: "Hace 1 hora", unread: true },
    { id: 3, title: "Usuario registrado", message: "Nuevo cliente se ha registrado", time: "Hace 2 horas", unread: false },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <nav
      className={`fixed top-0 z-30 ${darkMode ? 'bg-gray-800/95 text-white border-gray-700' : 'bg-white/95 border-slate-200 text-slate-900'} backdrop-blur-md border-b shadow-sm transition-all duration-300 ${isExpanded ? "left-64" : "left-20"} right-0`}
    >
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo y título */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gradient-to-r from-indigo-300 to-purple-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <div>
                <h1 className={`text-xl font-bold bg-clip-text text-transparent ${darkMode ? 'bg-gradient-to-r from-indigo-300 to-purple-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
                  Flowest Admin
                </h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Panel de administración</p>
              </div>
            </div>
          </div>

          {/* Acciones del navbar */}
          <div className="flex items-center space-x-3">
            {/* Botón de tema */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'}`}
              title={darkMode ? "Modo claro" : "Modo oscuro"}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-white" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* Notificaciones */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={toggleNotifications}
                className={`relative p-2.5 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'}`}
                title="Notificaciones"
              >
                <Bell className={`${darkMode ? 'text-white' : 'text-slate-600'} w-5 h-5`} />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{unreadCount}</span>
                  </div>
                )}
              </button>

              {/* Dropdown de notificaciones */}
              {isNotificationsOpen && (
                <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-lg border py-2 max-h-96 overflow-y-auto ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-slate-200'}`}>
                  <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-600' : 'border-slate-100'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Notificaciones</h3>
                      {unreadCount > 0 && (
                        <span className="text-sm text-indigo-600 font-medium">{unreadCount} nuevas</span>
                      )}
                    </div>
                  </div>

                  <div className="py-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-l-4 transition-colors ${notification.unread
                          ? "border-indigo-500 bg-indigo-50/30"
                          : "border-transparent"
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-900'} mb-1`}>
                              {notification.title}
                            </h4>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'} mb-1`}>
                              {notification.message}
                            </p>
                            <span className="text-xs text-slate-400">
                              {notification.time}
                            </span>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`px-4 py-3 border-t ${darkMode ? 'border-gray-600' : 'border-slate-100'}`}>
                    <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                      Ver todas las notificaciones
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Perfil de usuario */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={toggleProfile}
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gradient-to-r from-indigo-300 to-purple-400' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}>
                  <span className="text-white text-sm font-medium">
                    {(user?.nombre || "Usuario")[0].toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className={`text-sm font-medium truncate max-w-32 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {user?.nombre || "Usuario"}
                  </p>
                  <p className={`text-xs truncate max-w-32 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                    {user?.rol?.nombre || "Sin rol"}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${darkMode ? 'text-white' : 'text-slate-600'} ${isProfileOpen ? "rotate-180" : ""
                  }`} />
              </button>

              {/* Dropdown de perfil */}
              {isProfileOpen && (
                <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-lg border py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-slate-200'}`}>
                  <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-600' : 'border-slate-100'}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gradient-to-r from-indigo-300 to-purple-400' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}>
                        <span className="text-white font-medium">
                          {(user?.nombre || "Usuario")[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {user?.nombre || "Usuario"}
                        </p>
                        <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                          {user?.email || "usuario@email.com"}
                        </p>
                        <p className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md inline-block mt-1">
                          {user?.rol?.nombre || "Sin rol"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <button onClick={() => navigate("/perfil")} className={`w-full text-left px-4 py-2.5 text-sm flex items-center space-x-3 transition-colors ${darkMode ? 'text-white hover:bg-gray-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Mi perfil</span>
                    </button>
                  </div>

                  <div className={`border-t py-2 ${darkMode ? 'border-gray-600' : 'border-slate-100'}`}>
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center space-x-3 transition-colors ${darkMode ? 'text-red-300 hover:bg-red-900' : 'text-red-600 hover:bg-red-50'}`}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar