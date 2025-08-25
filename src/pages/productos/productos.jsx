"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Package, RefreshCw } from "lucide-react"
import { fetchProductos } from "./api/ProductoService"
import ProductoList from "./components/ProductoList"
import ProductoForm from "./components/ProductoForm"
import { useTheme } from "../../components/layout/ThemeContext.jsx" // Asegúrate que la ruta sea correcta

const Productos = () => {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [currentProducto, setCurrentProducto] = useState(null)

  // Usar el contexto de tema
  const { darkMode } = useTheme()

  useEffect(() => {
    loadProductos()
  }, [])

  const loadProductos = async () => {
    try {
      setLoading(true)
      const data = await fetchProductos()
      setProductos(data || [])
      setError(null)
    } catch (err) {
      setError("Error al cargar los productos: " + (err.message || "Error desconocido"))
      console.error("Error al cargar productos:", err)
      setProductos([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClick = () => {
    setCurrentProducto(null)
    setShowForm(true)
  }

  const handleEditClick = (producto) => {
    setCurrentProducto(producto)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setCurrentProducto(null)
  }

  const handleProductoUpdated = () => {
    loadProductos()
    setShowForm(false)
    setCurrentProducto(null)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div
        className={`rounded-xl shadow-xl p-6 border-l-4 border-indigo-500 ${
          darkMode ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-slate-50"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                Gestión de Productos
              </h1>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
                Administra tu catálogo de productos
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateClick}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <PlusCircle size={20} />
            <span>Nuevo Producto</span>
          </button>
        </div>

        {error && (
          <div
            className={`p-4 rounded-lg mb-6 border flex items-center ${
              darkMode ? "bg-red-900/20 text-red-300 border-red-500/30" : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
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
          <div
            className={`flex flex-col justify-center items-center h-64 rounded-lg border ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"
            }`}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className={`${darkMode ? "text-gray-400" : "text-slate-500"}`}>Cargando productos...</p>
          </div>
        ) : (
          <div className={`rounded-lg p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold flex items-center ${darkMode ? "text-white" : "text-slate-900"}`}>
                <Package size={18} className="mr-2 text-indigo-500" />
                Lista de Productos
              </h2>
              <button
                onClick={loadProductos}
                className={`p-2 transition-colors flex items-center gap-1 rounded-lg ${
                  darkMode
                    ? "text-gray-400 hover:text-indigo-400 hover:bg-gray-700"
                    : "text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                }`}
                title="Refrescar"
              >
                <RefreshCw size={16} />
                <span>Actualizar</span>
              </button>
            </div>
            <ProductoList productos={productos} onEdit={handleEditClick} onRefresh={loadProductos} />
          </div>
        )}
      </div>

      {showForm && <ProductoForm producto={currentProducto} onClose={handleFormClose} onSave={handleProductoUpdated} />}
    </div>
  )
}

export default Productos