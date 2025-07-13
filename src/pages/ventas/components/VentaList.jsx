"use client"

import { useState, useEffect } from "react"
import {
  CreditCard,
  Search,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  XIcon,
  DollarSign,
  BarChart4,
  XCircle,
  Banknote,
} from "lucide-react"
import { toast } from "react-toastify"
import { fetchVentas, deleteVenta } from "../api/ventaservice"
import VentaDetailModal from "./modals/VentaDetailModal.jsx"

const VentaList = ({ onEdit, onDelete, onRefresh }) => {
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)
  const [ventaToDelete, setVentaToDelete] = useState(null)
  const [showDetail, setShowDetail] = useState(null)
  const [filterMetodoPago, setFilterMetodoPago] = useState("todos")
  const [sortField, setSortField] = useState("fecha_venta")
  const [sortDirection, setSortDirection] = useState("desc")
  const [statsVisible, setStatsVisible] = useState(false)

  const itemsPerPage = 5

  // Implementar debounce para la búsqueda - OPTIMIZADO
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearchTerm !== searchTerm) {
        setDebouncedSearchTerm(searchTerm)
        setCurrentPage(1)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, debouncedSearchTerm])

  useEffect(() => {
    loadVentas()
  }, [onRefresh])

  const loadVentas = async () => {
    try {
      setLoading(true)
      const data = await fetchVentas()
      console.log("Ventas cargadas:", data)
      setVentas(data || [])
      setError(null)
    } catch (err) {
      const errorMessage = "Error al cargar las ventas"
      setError(errorMessage)
      console.error("Error al cargar ventas:", err)
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener el nombre del cliente de manera consistente
  const obtenerNombreCliente = (venta) => {
    // Intentar diferentes rutas para obtener el nombre del cliente
    return venta.Pedido?.Cliente?.nombrecompleto || venta.Cliente?.nombrecompleto || "Sin nombre"
  }

  // Función para formatear valores en pesos colombianos
  const formatearPesosColombianos = (valor) => {
    if (!valor) return "0"
    return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const handleDeleteClick = (venta) => {
    setVentaToDelete(venta)
    setIsDeleting(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteVenta(ventaToDelete.id)

      // SOLO mostrar toast para eliminación exitosa
      toast.success(`¡Venta #${ventaToDelete.id} eliminada exitosamente!`, {
        position: "top-right",
        autoClose: 4000,
      })

      onDelete()
      setIsDeleting(false)
      setVentaToDelete(null)
    } catch (error) {
      console.error("Error al eliminar venta:", error)
      const errorMessage = " " + error.message
      setError(errorMessage)
    }
  }

  const handleViewDetail = (venta) => {
    setShowDetail(venta)
  }

  // Función para ordenar ventas
  const sortVentas = (a, b) => {
    if (sortField === "fecha_venta") {
      return sortDirection === "asc"
        ? new Date(a.fecha_venta) - new Date(b.fecha_venta)
        : new Date(b.fecha_venta) - new Date(a.fecha_venta)
    } else if (sortField === "total_pagar") {
      return sortDirection === "asc" ? a.total_pagar - b.total_pagar : b.total_pagar - a.total_pagar
    } else if (sortField === "cliente") {
      const nombreA = obtenerNombreCliente(a)
      const nombreB = obtenerNombreCliente(b)
      return sortDirection === "asc" ? nombreA.localeCompare(nombreB) : nombreB.localeCompare(nombreA)
    }
    return 0
  }

  // Filtrar ventas - SIMPLIFICADO para enfocarse en búsqueda por cliente
  const filteredVentas = ventas
    .filter((venta) => {
      // Filtro por método de pago
      if (filterMetodoPago !== "todos" && venta.metodo_pago !== filterMetodoPago) {
        return false
      }

      // Si no hay término de búsqueda, mostrar todos
      if (!debouncedSearchTerm.trim()) {
        return true
      }

      const searchLower = debouncedSearchTerm.toLowerCase()
      const nombreCliente = obtenerNombreCliente(venta).toLowerCase()

      // Búsqueda principal por nombre de cliente (como especifica el requerimiento)
      return nombreCliente.includes(searchLower)
    })
    .sort(sortVentas)

  // Calcular páginas
  const totalPages = Math.ceil(filteredVentas.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedVentas = filteredVentas.slice(startIndex, startIndex + itemsPerPage)

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    if (ventas.length === 0) return { total: 0, promedio: 0, efectivo: 0, transferencia: 0 }

    const total = ventas.reduce((sum, venta) => sum + Number.parseFloat(venta.total_pagar || 0), 0)
    const promedio = total / ventas.length
    const efectivo = ventas.filter((v) => v.metodo_pago === "efectivo").length
    const transferencia = ventas.filter((v) => v.metodo_pago === "transferencia").length

    return { total, promedio, efectivo, transferencia }
  }

  const stats = calcularEstadisticas()

  // Componente para renderizar una fila de la tabla
  const VentaRow = ({ venta, onEdit, handleViewDetail, handleDeleteClick }) => {
    const metodoPagoClasses = {
      efectivo: "bg-green-900 text-green-300 border-green-500",
      transferencia: "bg-blue-900 text-blue-300 border-blue-500",
    }

    return (
      <tr className="hover:bg-gray-800 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">#{venta.id}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">#{venta.id_pedido}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{obtenerNombreCliente(venta)}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
          ${formatearPesosColombianos(venta.total_pagar || 0)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full border ${metodoPagoClasses[venta.metodo_pago]}`}
          >
            {venta.metodo_pago === "efectivo" ? (
              <>
                <Banknote className="mr-1" size={12} />
                Efectivo
              </>
            ) : (
              <>
                <CreditCard className="mr-1" size={12} />
                Transferencia
              </>
            )}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
          {venta.fecha_venta
            ? new Date(venta.fecha_venta).toLocaleString("es-CO", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Fecha no disponible"}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewDetail(venta)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
              title="Ver detalles"
              type="button"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => onEdit(venta)}
              className="text-orange-500 hover:text-orange-400 transition-colors"
              title="Editar"
              type="button"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => handleDeleteClick(venta)}
              className="text-red-500 hover:text-red-400 transition-colors"
              title="Eliminar"
              type="button"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  // Componente para la barra de búsqueda mejorada
  const SearchBar = () => (
    <div className="flex flex-col gap-4 mb-6">
      {/* Barra de búsqueda principal */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
            <Search className="text-gray-400 ml-3" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre de cliente..."
              className="w-full bg-transparent border-none text-white focus:outline-none px-3 py-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-gray-400 hover:text-white p-2 mr-1"
                type="button"
              >
                <XIcon size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <select
              value={filterMetodoPago}
              onChange={(e) => setFilterMetodoPago(e.target.value)}
              className="appearance-none bg-gray-800 border border-gray-700 text-white py-3 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="todos">Todos los métodos</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
            </select>
            <Filter
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>

          <button
            onClick={() => setStatsVisible(!statsVisible)}
            className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 px-4"
            title={statsVisible ? "Ocultar estadísticas" : "Mostrar estadísticas"}
            type="button"
          >
            <BarChart4 size={20} />
          </button>

          <button
            onClick={onRefresh}
            className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
            title="Refrescar"
            type="button"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Mostrar resultados de búsqueda */}
      {debouncedSearchTerm && (
        <div className="text-sm text-gray-400">
          {filteredVentas.length > 0
            ? `${filteredVentas.length} venta(s) encontrada(s) para "${debouncedSearchTerm}"`
            : `No se encontraron ventas para "${debouncedSearchTerm}"`}
        </div>
      )}
    </div>
  )

  // Componente para la paginación
  const Pagination = () => {
    if (filteredVentas.length <= 5) return null

    return (
      <div className="flex justify-between items-center mt-4 text-white">
        <div>
          Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredVentas.length)} de{" "}
          {filteredVentas.length} ventas
        </div>
        <div className="flex space-x-2">
          <PaginationButton
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            icon={<ChevronLeft size={20} />}
          />

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-md ${
                currentPage === page
                  ? "bg-orange-600 text-white border border-orange-500"
                  : "text-white hover:bg-gray-800 border border-gray-700"
              }`}
            >
              {page}
            </button>
          ))}

          <PaginationButton
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            icon={<ChevronRight size={20} />}
          />
        </div>
      </div>
    )
  }

  // Botón de paginación reutilizable
  const PaginationButton = ({ onClick, disabled, icon }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-md ${
        disabled ? "text-gray-500 cursor-not-allowed" : "text-white hover:bg-gray-800 border border-gray-700"
      }`}
    >
      {icon}
    </button>
  )

  // Componente para encabezado de columna ordenable
  const SortableHeader = ({ field, label }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:text-orange-400"
      onClick={() => {
        if (sortField === field) {
          setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
          setSortField(field)
          setSortDirection("asc")
        }
      }}
    >
      <div className="flex items-center">
        {label}
        <ArrowUpDown size={14} className="ml-1" />
      </div>
    </th>
  )

  // Componente para mostrar estadísticas
  const StatsPanel = () => {
    if (!statsVisible) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border-l-4 border-orange-500 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Ventas</p>
              <h3 className="text-2xl font-bold text-white">${formatearPesosColombianos(stats.total.toFixed(2))}</h3>
            </div>
            <div className="bg-orange-500 bg-opacity-20 p-3 rounded-full">
              <DollarSign className="text-orange-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border-l-4 border-blue-500 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Promedio</p>
              <h3 className="text-2xl font-bold text-white">${formatearPesosColombianos(stats.promedio.toFixed(2))}</h3>
            </div>
            <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full">
              <BarChart4 className="text-blue-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border-l-4 border-green-500 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Efectivo</p>
              <h3 className="text-2xl font-bold text-white">{stats.efectivo} ventas</h3>
            </div>
            <div className="bg-green-500 bg-opacity-20 p-3 rounded-full">
              <Banknote className="text-green-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border-l-4 border-purple-500 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Transferencia</p>
              <h3 className="text-2xl font-bold text-white">{stats.transferencia} ventas</h3>
            </div>
            <div className="bg-purple-500 bg-opacity-20 p-3 rounded-full">
              <CreditCard className="text-purple-500" size={24} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Vista de tabla
  const TableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
        <thead className="bg-gray-900 text-orange-500 border-b border-orange-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Pedido</th>
            <SortableHeader field="cliente" label="Cliente" />
            <SortableHeader field="total_pagar" label="Total" />
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Método Pago</th>
            <SortableHeader field="fecha_venta" label="Fecha" />
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {paginatedVentas.length > 0 ? (
            paginatedVentas.map((venta) => (
              <VentaRow
                key={venta.id}
                venta={venta}
                onEdit={onEdit}
                handleViewDetail={handleViewDetail}
                handleDeleteClick={handleDeleteClick}
              />
            ))
          ) : (
            <tr>
              <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                {debouncedSearchTerm ? (
                  <div>
                    <p className="text-lg mb-2">No se encontraron ventas</p>
                    <p className="text-sm">No hay ventas que coincidan con "{debouncedSearchTerm}"</p>
                  </div>
                ) : (
                  "No hay ventas registradas"
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div>
      <SearchBar />

      {error && (
        <div className="bg-red-900 text-red-200 p-4 mb-4 rounded-lg border border-red-700">
          <p className="flex items-center">
            <XCircle className="mr-2" size={20} />
            {error}
          </p>
        </div>
      )}

      <StatsPanel />
      <TableView />
      <Pagination />

      {/* Modal de confirmación de eliminación */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Confirmar eliminación</h3>
            <p className="text-gray-300 mb-6">
              ¿Estás seguro de que deseas eliminar la venta #{ventaToDelete?.id}? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleting(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles de la venta */}
      {showDetail && (
        <VentaDetailModal
          venta={showDetail}
          onClose={() => setShowDetail(null)}
          onEdit={() => {
            onEdit(showDetail)
            setShowDetail(null)
          }}
        />
      )}
    </div>
  )
}

export default VentaList
