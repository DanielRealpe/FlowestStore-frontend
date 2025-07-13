"use client"

import { useState, useEffect } from "react"
import ClienteList from "./components/ClienteList"
import ClienteForm from "./components/ClienteForm"
import { fetchClientes } from "./api/clienteService"
import { PlusCircle, Users, RefreshCw } from "lucide-react"

const Cliente = () => {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [currentCliente, setCurrentCliente] = useState(null)

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = async () => {
    try {
      setLoading(true)
      const data = await fetchClientes()
      setClientes(data)// Asegurarse de que siempre sea un array
      setError(null)
    } catch (err) {
      setError("Error al cargar los clientes: " + (err.message || "Error desconocido"))
      console.error("Error al cargar clientes:", err)
      setClientes([]) // Establecer un array vacío en caso de error
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClick = () => {
    setCurrentCliente(null)
    setShowForm(true)
  }

  const handleEditClick = (cliente) => {
    setCurrentCliente(cliente)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setCurrentCliente(null)
  }

  const handleClienteUpdated = () => {
    loadClientes()
    setShowForm(false)
    setCurrentCliente(null)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl shadow-xl p-6 border-l-4 border-orange-500">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="bg-orange-500 p-3 rounded-lg mr-4 shadow-lg shadow-orange-500/20">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Gestión de Clientes</h1>
              <p className="text-gray-400 text-sm">Administra la información de tus clientes</p>
            </div>
          </div>
          <button
            onClick={handleCreateClick}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <PlusCircle size={20} />
            <span>Registrar Cliente</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-900 text-white p-4 rounded-lg mb-6 animate-pulse border border-red-500 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-gray-800 rounded-lg border border-gray-700">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-400">Cargando clientes...</p>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <Users size={18} className="mr-2 text-orange-400" />
                Lista de Clientes
              </h2>
              <button
                onClick={loadClientes}
                className="p-2 text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-1"
                title="Refrescar"
              >
                <RefreshCw size={16} />
                <span>Actualizar</span>
              </button>
            </div>
            <ClienteList
              clientes={clientes}
              onEdit={handleEditClick}
              onDelete={loadClientes}
              onRefresh={loadClientes}
            />
          </div>
        )}
      </div>

      {showForm && <ClienteForm cliente={currentCliente} onClose={handleFormClose} onSave={handleClienteUpdated} />}
    </div>
  )
}

export default Cliente

