"use client"

import { useState } from "react"
import RolForm from "./components/RolForm"
import RolList from "./components/RolList"
import { Shield, Settings, AlertTriangle } from "lucide-react"

const Configuracion = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [rolEditando, setRolEditando] = useState(null)
  const [activeTab, setActiveTab] = useState("list") // 'list' or 'form'

  const handleRolCreado = () => {
    // Actualizar la lista cuando se crea un nuevo rol
    setRefreshTrigger((prev) => prev + 1)
    setActiveTab("list") // Cambiar a la lista después de crear
  }

  const handleEditRol = (rol) => {
    setRolEditando(rol)
    setActiveTab("form") // Cambiar al formulario al editar
  }

  const handleAddNewClick = () => {
    setRolEditando(null)
    setActiveTab("form")
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl border-l-4 border-orange-500 shadow-lg">
          <div className="flex items-center space-x-3">
            <Shield className="text-orange-500 h-8 w-8" />
            <h1 className="text-3xl font-bold text-white">Configuración de Roles y Permisos</h1>
          </div>
          <p className="text-gray-400 mt-2 ml-11">Gestione los roles y permisos de los usuarios del sistema</p>
        </header>

        {/* Tabs de navegación */}
        <div className="flex mb-6 bg-gray-800 rounded-lg p-1 max-w-md">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === "list" ? "bg-orange-500 text-white shadow-lg" : "text-gray-400 hover:text-white"
            }`}
          >
            <Shield size={18} />
            <span>Roles Existentes</span>
          </button>
          <button
            onClick={handleAddNewClick}
            className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === "form" ? "bg-orange-500 text-white shadow-lg" : "text-gray-400 hover:text-white"
            }`}
          >
            <Settings size={18} />
            <span>{rolEditando ? "Editar Rol" : "Nuevo Rol"}</span>
          </button>
        </div>

        {/* Contenido principal */}
        <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl border-r-2 border-orange-500 animate-fade-in">
          <div className="flex justify-between items-center p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white flex items-center">
              {activeTab === "list" ? (
                <>
                  <Shield className="mr-2 text-orange-500" size={20} />
                  Roles del Sistema
                </>
              ) : (
                <>
                  <Settings className="mr-2 text-orange-500" size={20} />
                  {rolEditando ? `Editar: ${rolEditando.nombre}` : "Crear Nuevo Rol"}
                </>
              )}
            </h2>
            {activeTab === "list" && (
              <button
                onClick={handleAddNewClick}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200 transform hover:scale-105"
              >
                <span className="mr-1">+</span> Nuevo Rol
              </button>
            )}
          </div>

          <div className="p-6">
            {activeTab === "list" ? (
              <RolList onEditRol={handleEditRol} refreshTrigger={refreshTrigger} />
            ) : (
              <RolForm onRolCreado={handleRolCreado} rolEditar={rolEditando} onCancel={() => setActiveTab("list")} />
            )}
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default Configuracion

