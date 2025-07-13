"use client"

import { useState, useEffect } from "react"
import { fetchPedidos } from "./api/pedidoservice"
import PedidoList from "./components/PedidoList"
import PedidoForm from "./components/PedidoForm"
import { PlusCircle } from "lucide-react"

const Pedido = () => {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [currentPedido, setCurrentPedido] = useState(null)

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
      <div className="bg-gray-900 rounded-xl shadow-2xl p-6 border-r-2 border-orange-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestión de Pedidos</h1>
            <p className="text-gray-400">Administra y visualiza todos los pedidos del sistema</p>
          </div>

          <button
            onClick={handleCreateClick}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <PlusCircle size={20} />
            <span>Nuevo Pedido</span>
          </button>
        </div>

        {error && <div className="bg-red-500 text-white p-4 rounded-lg mb-6 animate-pulse">{error}</div>}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <PedidoList pedidos={pedidos} onEdit={handleEditClick} onDelete={loadPedidos} onRefresh={loadPedidos} />
        )}
      </div>

      {showForm && <PedidoForm pedido={currentPedido} onClose={handleFormClose} onSave={handlePedidoUpdated} />}
    </div>
  )
}

export default Pedido

