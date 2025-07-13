"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Bell, User, LogOut } from "lucide-react"
import { useAuth } from "../../pages/usuarios/context/AuthContext"

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { user, signout } = useAuth()

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  const handleLogout = async () => {
    await signout()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-gray-900 shadow-md px-4 py-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-white text-xl font-bold ml-4">Sistema de Gestión</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-gray-300 hover:text-white">
            <Bell size={20} />
          </button>

          <div className="relative">
            <button
              onClick={toggleProfile}
              className="flex items-center text-gray-300 hover:text-white focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <User size={18} />
              </div>
              <span className="ml-2 hidden md:block">{user?.nombre || "Usuario"}</span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-20">
                <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                  <p className="font-semibold">{user?.nombre}</p>
                  <p className="text-xs">{user?.email}</p>
                </div>
                <Link to="/perfil" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                  Mi Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                >
                  <LogOut size={16} className="mr-2" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
