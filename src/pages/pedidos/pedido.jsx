"use client"

import { useState, useEffect } from "react"
import { fetchPedidos } from "./api/pedidoservice"
import PedidoList from "./components/PedidoList"
import PedidoForm from "./components/PedidoForm"
import { PlusCircle, ShoppingBag } from "lucide-react"
import { useTheme } from "../../components/layout/ThemeContext.jsx"

const Pedido = () => {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [currentPedido, setCurrentPedido] = useState(null)
  const { darkMode } = useTheme()

  // Cargar pedidos al montar el componente
  useEffect(() => {
    loadPedidos()
  }, [])

  const loadPedidos = async () => {
    try {
      setLoading(true)
      const data = await fetchPedidos()
      setPedidos(data)
      setError(null)
    } catch (err) {
      setError("Error al cargar los pedidos: " + (err.message || "Error desconocido"))
      console.error("Error al cargar pedidos:", err)
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClick = () => {
    setCurrentPedido(null)
    setShowForm(true)
  }

  const handleEditClick = (pedido) => {
    setCurrentPedido(pedido)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setCurrentPedido(null)
  }

  const handlePedidoUpdated = () => {
    loadPedidos()
    setShowForm(false)
    setCurrentPedido(null)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className={`rounded-xl shadow-xl p-6 border-l-4 border-indigo-500 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-white to-slate-50'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div>
              <h1 className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Gestión de Pedidos
              </h1>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-slate-500'
              }`}>
                Administra y visualiza todos los pedidos del sistema
              </p>
            </div>
          </div>

          <button
            onClick={handleCreateClick}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 
                     hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 
                     transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <PlusCircle size={20} />
            <span>Nuevo Pedido</span>
          </button>
        </div>

        {error && (
          <div className={`p-4 rounded-lg mb-6 border flex items-center ${
            darkMode 
              ? 'bg-red-900/20 text-red-300 border-red-500/30' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
              darkMode ? 'border-indigo-500' : 'border-indigo-600'
            }`}></div>
          </div>
        ) : (
          <div className={`rounded-lg p-6 border ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold flex items-center ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <ShoppingBag size={18} className="mr-2 text-indigo-500" />
                Lista de Pedidos
              </h2>
            </div>
            <PedidoList 
              pedidos={pedidos} 
              onEdit={handleEditClick} 
              onDelete={loadPedidos} 
              onRefresh={loadPedidos} 
            />
          </div>
        )}
      </div>

      {showForm && (
        <PedidoForm 
          pedido={currentPedido} 
          onClose={handleFormClose} 
          onSave={handlePedidoUpdated} 
        />
      )}
    </div>
  )
}

export default Pedido

