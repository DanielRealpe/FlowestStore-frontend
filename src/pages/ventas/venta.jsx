"use client"

import { useState, useEffect } from "react"
import { fetchVentas } from "./api/ventaservice"
import VentaList from "./components/VentaList"
import VentaForm from "./components/VentaForm"
import VentaDetailModal from "./components/modals/VentaDetailModal"

const Venta = () => {
  const [ventas, setVentas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedVenta, setSelectedVenta] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(false)

  useEffect(() => {
    const loadVentas = async () => {
      try {
        setIsLoading(true)
        const data = await fetchVentas()
        setVentas(data)
        setError(null)
      } catch (err) {
        setError("Error al cargar las ventas: " + err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadVentas()
  }, [refreshTrigger])

  const handleVentaSaved = (ventaData) => {
    if (ventaData) {
      if (selectedVenta) {
        setVentas(prevVentas => 
          prevVentas.map(v => v.id === ventaData.id ? ventaData : v)
        )
      } else {
        setVentas(prevVentas => [ventaData, ...prevVentas])
      }
    } else {
      setRefreshTrigger(prev => !prev)
    }
    
    setShowForm(false)
    setSelectedVenta(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    )
  }

  const ErrorAlert = () => (
    <div className="bg-red-900 text-red-200 p-4 mb-6 rounded-lg border border-red-700">
      <p className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        {error}
      </p>
    </div>
  )

  return (
    <div className="container mx-auto p-6 bg-gray-900 min-h-screen">
      {/* Encabezado con doble borde */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-white border-white-500">
        <h1 className="text-3xl font-bold text-white">Gestión de Ventas</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors border-2 border-orange-500"
        >
          Nueva Venta
        </button>
      </div>

      {error && <ErrorAlert />}

      {/* Contenedor principal con borde anaranjado */}
      <div className="bg-gray-800 rounded-xl border-2 border-gray-500 p-4">
        <VentaList
          ventas={ventas}
          onVentasChange={setVentas}
          onEdit={(venta) => {
            setSelectedVenta(venta)
            setShowForm(true)
          }}
          onDelete={(deletedId) => {
            setVentas(prev => prev.filter(v => v.id !== deletedId))
          }}
          onRefresh={() => setRefreshTrigger(prev => !prev)}
        />
      </div>

      {/* Modales (mantener sin cambios) */}
      {showForm && (
        <VentaForm
          venta={selectedVenta}
          onClose={() => {
            setShowForm(false)
            setSelectedVenta(null)
          }}
          onSave={handleVentaSaved}
        />
      )}

      {selectedVenta && !showForm && (
        <VentaDetailModal
          venta={selectedVenta}
          onClose={() => setSelectedVenta(null)}
          onEdit={(venta) => {
            setSelectedVenta(venta)
            setShowForm(true)
          }}
        />
      )}
    </div>
  )
}


export default Venta