"use client"

import { useState, useEffect } from "react"
import {
  XCircle,
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
} from "lucide-react"
import { fetchPedidos, deletePedido, togglePedidoEstado } from "../api/pedidoservice.js"
import CambiarEstadoModal from "../modals/CambiarEstadoModal.jsx"
import PedidoDetailModal from "../modals/PedidoDetailModal.jsx"
import { toast } from "react-toastify"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PedidoList = ({ onEdit, onDelete, onRefresh }) => {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pedidoToDelete, setPedidoToDelete] = useState(null)
  const [showDetail, setShowDetail] = useState(null)
  const [showEstadoModal, setShowEstadoModal] = useState(false)
  const [pedidoToChangeStatus, setPedidoToChangeStatus] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [viewMode, setViewMode] = useState("table") // "table" o "kanban"
  const [filterEstado, setFilterEstado] = useState("todos")
  const [sortField, setSortField] = useState("fecha_pedido")
  const [sortDirection, setSortDirection] = useState("desc")
  const [searchCategory, setSearchCategory] = useState("all")
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)

  const itemsPerPage = 5

  // Implementar debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    loadPedidos()
  }, [])

  const loadPedidos = async () => {
    try {
      setLoading(true)
      const data = await fetchPedidos()
      setPedidos(data || [])
      setError(null)
      
    } catch (err) {
      setError("Error al cargar los pedidos")
      console.error("Error al cargar pedidos:", err)
      toast.error("Error al cargar los pedidos. Por favor, intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Función para formatear valores en pesos colombianos
  const formatearPesosColombianos = (valor) => {
    // Convierte el valor a string y formatea con separadores de miles
    return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const handleDeleteClick = (pedido) => {
    setPedidoToDelete(pedido)
    setIsDeleting(true)
  }

  const confirmDelete = async () => {
    try {
      await deletePedido(pedidoToDelete.id)
      // Actualizar la lista local directamente
      setPedidos(prevPedidos => prevPedidos.filter(p => p.id !== pedidoToDelete.id))
      onDelete() // Llamar callback si es necesario
      setIsDeleting(false)
      setPedidoToDelete(null)
      toast.success(`Pedido #${pedidoToDelete.id} eliminado exitosamente`)
    } catch (error) {
      console.error("Error al eliminar pedido:", error)
      setError("Error al eliminar: " + error.message)
      toast.error(`Error al eliminar el pedido: ${error.message}`)
    }
  }

  const handleChangeStatus = (pedido) => {
    // No permitir cambiar el estado si ya está terminado
    if (pedido.estado === "terminado") {
      toast.warning("No se puede cambiar el estado de pedidos terminados")
      return
    }

    setPedidoToChangeStatus(pedido)
    setShowEstadoModal(true)
  }

  const confirmChangeStatus = async (estado) => {
    try {
      setIsUpdating(true)
      await togglePedidoEstado(pedidoToChangeStatus.id, estado)
      
      // Actualizar la lista local
      setPedidos(prevPedidos => 
        prevPedidos.map(pedido => 
          pedido.id === pedidoToChangeStatus.id 
            ? { ...pedido, estado }
            : pedido
        )
      )
      
      onRefresh() // Llamar callback si es necesario
      setShowEstadoModal(false)

      const estadoTexto = {
        pendiente: "Pendiente",
        preparacion: "En Preparación",
        terminado: "Terminado",
        cancelado: "Cancelado",
      }

      toast.success(`Estado del pedido #${pedidoToChangeStatus.id} cambiado a: ${estadoTexto[estado]}`)
      setPedidoToChangeStatus(null)
    } catch (error) {
      console.error("Error al cambiar estado del pedido:", error)
      setError("Error al cambiar estado: " + error.message)
      toast.error(`Error al cambiar el estado: ${error.message}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleViewDetail = (pedido) => {
    setShowDetail(pedido)
    toast.info(`Mostrando detalles del pedido #${pedido.id}`)
  }

  // Función para ordenar pedidos
  const sortPedidos = (a, b) => {
    if (sortField === "fecha_pedido") {
      return sortDirection === "asc"
        ? new Date(a.fecha_pedido) - new Date(b.fecha_pedido)
        : new Date(b.fecha_pedido) - new Date(a.fecha_pedido)
    } else if (sortField === "total") {
      return sortDirection === "asc" ? a.total - b.total : b.total - a.total
    } else if (sortField === "cliente") {
      const nombreA = a.Cliente?.nombrecompleto || ""
      const nombreB = b.Cliente?.nombrecompleto || ""
      return sortDirection === "asc" ? nombreA.localeCompare(nombreB) : nombreB.localeCompare(nombreA)
    }
    return 0
  }

  // Filtrar y ordenar pedidos con búsqueda avanzada
  const filteredPedidos = pedidos
    .filter((pedido) => {
      // Filtro por estado
      if (filterEstado !== "todos" && pedido.estado !== filterEstado) {
        return false
      }

      // Si no hay término de búsqueda, mostrar todos
      if (!debouncedSearchTerm.trim()) {
        return true
      }

      const searchLower = debouncedSearchTerm.toLowerCase()

      // Búsqueda por categoría específica
      if (searchCategory === "cliente") {
        return pedido.Cliente?.nombrecompleto?.toLowerCase().includes(searchLower)
      } else if (searchCategory === "producto") {
        // Corregir la búsqueda de productos
        return pedido.Productos?.some((p) => p.nombre?.toLowerCase().includes(searchLower))
      } else if (searchCategory === "id") {
        return pedido.id.toString().includes(debouncedSearchTerm)
      } else if (searchCategory === "monto") {
        // Búsqueda por monto (aproximado)
        const montoStr = pedido.total.toString()
        return montoStr.includes(debouncedSearchTerm)
      } else {
        // Búsqueda en todos los campos
        return (
          pedido.Cliente?.nombrecompleto?.toLowerCase().includes(searchLower) ||
          pedido.direccion_envio?.toLowerCase().includes(searchLower) ||
          pedido.Productos?.some((p) => p.nombre?.toLowerCase().includes(searchLower)) ||
          pedido.id.toString().includes(debouncedSearchTerm) ||
          pedido.total.toString().includes(debouncedSearchTerm)
        )
      }
    })
    .sort(sortPedidos)

  // Calcular páginas
  const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedPedidos = filteredPedidos.slice(startIndex, startIndex + itemsPerPage)

  // Agrupar pedidos por estado para vista Kanban
  const pedidosByEstado = {
    pendiente: filteredPedidos.filter((p) => p.estado === "pendiente"),
    preparacion: filteredPedidos.filter((p) => p.estado === "preparacion"),
    terminado: filteredPedidos.filter((p) => p.estado === "terminado"),
    cancelado: filteredPedidos.filter((p) => p.estado === "cancelado"),
  }

  // Función para encontrar un pedido por ID
  const findPedidoById = (id) => {
    return pedidos.find(p => p.id === id) || null
  }

  // Función para actualizar el estado de un pedido en Kanban
  const handleUpdatePedidoEstado = async (pedidoId, nuevoEstado) => {
    const pedido = findPedidoById(pedidoId)
    if (!pedido) return

    // No permitir mover pedidos terminados
    if (pedido.estado === 'terminado') {
      toast.warning("No se puede cambiar el estado de pedidos terminados")
      return
    }

    try {
      await togglePedidoEstado(pedidoId, nuevoEstado)
      
      // Actualizar la lista local
      setPedidos(prevPedidos => 
        prevPedidos.map(p => 
          p.id === pedidoId 
            ? { ...p, estado: nuevoEstado }
            : p
        )
      )

      const estadoTexto = {
        pendiente: "Pendiente",
        preparacion: "En Preparación",
        terminado: "Terminado",
        cancelado: "Cancelado",
      }

      toast.success(`Estado del pedido #${pedidoId} cambiado a: ${estadoTexto[nuevoEstado]}`)
    } catch (error) {
      console.error("Error al cambiar estado del pedido:", error)
      toast.error(`Error al cambiar el estado: ${error.message}`)
    }
  }

  // Componente para renderizar una fila de la tabla
  const PedidoRow = ({ pedido, onEdit, handleViewDetail, handleDeleteClick, handleChangeStatus, isUpdating }) => {
    const estadoClasses = {
      pendiente: "bg-yellow-900 text-yellow-300 border-yellow-500",
      preparacion: "bg-blue-900 text-blue-300 border-blue-500",
      terminado: "bg-green-900 text-green-300 border-green-500",
      cancelado: "bg-red-900 text-red-300 border-red-500",
    }

    return (
      <tr className="hover:bg-gray-800 transition-colors">
        {/* ID */}
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">#{pedido.id}</td>

        {/* Cliente */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{pedido.Cliente?.nombrecompleto}</td>

        {/* Total */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
          ${formatearPesosColombianos(pedido.total)}
        </td>

        {/* Estado */}
        <td className="px-6 py-4 whitespace-nowrap">
          <button
            onClick={() => handleChangeStatus(pedido)}
            disabled={isUpdating || pedido.estado === "terminado"}
            className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full border ${estadoClasses[pedido.estado]} transition-colors ${pedido.estado === "terminado" ? "opacity-50 cursor-not-allowed" : ""}`}
            title={
              pedido.estado === "terminado" ? "No se puede cambiar el estado de pedidos terminados" : "Cambiar estado"
            }
          >
            {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
          </button>
        </td>

        {/* Fecha */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
          {new Date(pedido.fecha_pedido).toLocaleString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </td>

        {/* Acciones */}
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewDetail(pedido)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
              title="Ver detalles"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => onEdit(pedido)}
              className="text-orange-500 hover:text-orange-400 transition-colors"
              title="Editar"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => handleDeleteClick(pedido)}
              className="text-red-500 hover:text-red-400 transition-colors"
              title="Eliminar"
              disabled={pedido.estado === "terminado"}
            >
              <Trash2 size={18} className={pedido.estado === "terminado" ? "opacity-50 cursor-not-allowed" : ""} />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  // Componente para tarjeta de pedido en vista Kanban
  const PedidoCard = ({ pedido }) => {
    const borderColors = {
      pendiente: "border-yellow-500",
      preparacion: "border-blue-500",
      terminado: "border-green-500",
      cancelado: "border-red-500",
    }

    return (
      <div
        className={`bg-gray-800 rounded-lg p-4 mb-3 border-r-2 ${borderColors[pedido.estado]} shadow-md hover:shadow-lg transition-all flex flex-col justify-between h-full`}
      >
        <div className="flex-grow">
          <h3 className="text-white text-center text-lg font-semibold mb-2">
            Pedido #{pedido.id}
          </h3>
          <p className="text-white text-center text-sm mb-2">
            {pedido.Cliente?.nombrecompleto || "Sin cliente"}
          </p>
          <p className="text-center text-sm text-gray-400 mb-2">
            ${formatearPesosColombianos(pedido.total)}
          </p>
          <p className="text-center text-xs text-gray-500 mb-2">
            {new Date(pedido.fecha_pedido).toLocaleString("es-CO", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex justify-center gap-4 pt-3 border-t border-gray-600">
          <button
            onClick={() => handleViewDetail(pedido)}
            className="text-blue-400 hover:text-blue-300"
            title="Ver detalles"
          >
            <Eye size={18} />
          </button>
            {pedido.estado !== "terminado" && (
            <button onClick={() => onEdit(pedido)} className="text-orange-500 hover:text-orange-400" title="Editar">
              <Edit size={18} />
            </button>
          )}
        </div>
      </div>
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
              placeholder="Buscar..."
              className="w-full bg-transparent border-none text-white focus:outline-none px-3 py-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-gray-400 hover:text-white p-2 mr-1">
                <XIcon size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <select
              value={filterEstado}
              onChange={(e) => {
                setFilterEstado(e.target.value)
                const estadoTexto = e.target.value === "todos" ? "todos los estados" : e.target.value
                toast.info(`Filtro aplicado: ${estadoTexto}`)
              }}
              className="appearance-none bg-gray-800 border border-gray-700 text-white py-3 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="preparacion">En preparación</option>
              <option value="terminado">Terminados</option>
              <option value="cancelado">Cancelados</option>
            </select>
            <Filter
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>

          <button
            onClick={() => {
              setShowAdvancedSearch(!showAdvancedSearch)
              toast.info(`Búsqueda avanzada ${!showAdvancedSearch ? 'activada' : 'desactivada'}`)
            }}
            className={`px-4 py-2 rounded-lg transition-colors border ${
              showAdvancedSearch 
                ? 'bg-orange-600 text-white border-orange-500' 
                : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'
            }`}
            title="Búsqueda avanzada"
          >
            Avanzada
          </button>

          <button
            onClick={() => {
              const nuevoModo = viewMode === "table" ? "kanban" : "table"
              setViewMode(nuevoModo)
              toast.info(`Vista cambiada a: ${nuevoModo === "table" ? "Tabla" : "Kanban"}`)
            }}
            className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 px-4"
            title={viewMode === "table" ? "Ver como Kanban" : "Ver como Tabla"}
          >
            {viewMode === "table" ? "Kanban" : "Tabla"}
          </button>

          <button
            onClick={() => {
              loadPedidos() // Cambiar por loadPedidos en lugar de onRefresh
              toast.info("Actualizando lista de pedidos...")
            }}
            className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
            title="Refrescar"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Opciones de búsqueda avanzada */}
      {showAdvancedSearch && (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 animate-fadeIn">
          <div className="mb-3">
            <h4 className="text-white font-medium mb-2">Buscar por:</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSearchCategory("all")}
                className={`px-3 py-1 rounded-full text-sm ${
                  searchCategory === "all" ? "bg-orange-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Todos los campos
              </button>
              <button
                onClick={() => setSearchCategory("cliente")}
                className={`px-3 py-1 rounded-full text-sm ${
                  searchCategory === "cliente"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Cliente
              </button>
              <button
                onClick={() => setSearchCategory("producto")}
                className={`px-3 py-1 rounded-full text-sm ${
                  searchCategory === "producto"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Producto
              </button>
              <button
                onClick={() => setSearchCategory("id")}
                className={`px-3 py-1 rounded-full text-sm ${
                  searchCategory === "id" ? "bg-orange-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                ID
              </button>
              <button
                onClick={() => setSearchCategory("monto")}
                className={`px-3 py-1 rounded-full text-sm ${
                  searchCategory === "monto"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Monto
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            <p>Resultados encontrados: {filteredPedidos.length}</p>
          </div>
        </div>
      )}
    </div>
  )

  // Componente para la paginación
  const Pagination = () => {
    // Only show pagination if we have more than 5 items
    if (filteredPedidos.length <= 5) return null

    return (
      <div className="flex justify-between items-center mt-4 text-white">
        <div>
          Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredPedidos.length)} de{" "}
          {filteredPedidos.length} pedidos
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

  // Vista de tabla
  const TableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
        <thead className="bg-gray-900 text-orange-500 border-b border-orange-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
            <SortableHeader field="cliente" label="Cliente" />
            <SortableHeader field="total" label="Total" />
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
            <SortableHeader field="fecha_pedido" label="Fecha" />
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {paginatedPedidos.length > 0 ? (
            paginatedPedidos.map((pedido) => (
              <PedidoRow
                key={pedido.id}
                pedido={pedido}
                onEdit={onEdit}
                handleViewDetail={handleViewDetail}
                handleDeleteClick={handleDeleteClick}
                handleChangeStatus={handleChangeStatus}
                isUpdating={isUpdating}
              />
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                No se encontraron pedidos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )

  // Componente para tarjeta de pedido draggable (única declaración)
  const DraggablePedidoCard = ({ pedido }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ 
      id: pedido.id,
      disabled: pedido.estado === 'terminado'
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`
          ${pedido.estado === 'terminado' 
            ? 'cursor-not-allowed opacity-75' 
            : 'cursor-grab hover:bg-gray-750 active:cursor-grabbing'
          }
          transition-colors duration-200
        `}
      >
        <PedidoCard pedido={pedido} />
      </div>
    );
  };

  // Componente para las columnas del Kanban
  const DroppableColumn = ({  title, pedidos, color, children }) => {
    return (
      <SortableContext items={pedidos.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div className="bg-gray-900 rounded-lg p-4 min-h-[400px] w-full md:w-64">
          <h3 className={`text-lg font-bold mb-4 pb-2 border-b text-${color}-500 border-${color}-500`}>
            {title} ({pedidos.length})
          </h3>
          <div className="space-y-3">
            {pedidos.length > 0 ? (
              pedidos.map((pedido) => (
                <DraggablePedidoCard key={pedido.id} pedido={pedido} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                {children}
              </p>
            )}
          </div>
           </div>
      </SortableContext>
    );
  };

  // Configuración de sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Manejador para el evento de arrastrar y soltar
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Encontrar el pedido que se está moviendo
    const activePedido = findPedidoById(activeId);
    if (!activePedido) return;

    // Determinar el nuevo estado basado en la columna de destino
    let nuevoEstado = null;
    
    // Si se suelta sobre una columna específica
    const columnIds = ['pendiente', 'preparacion', 'terminado', 'cancelado'];
    if (columnIds.includes(overId)) {
      nuevoEstado = overId;
    } else {
      // Si se suelta sobre otro pedido, determinar la columna por el estado del pedido destino
      const overPedido = findPedidoById(overId);
      if (overPedido) {
        nuevoEstado = overPedido.estado;
      }
    }

    // Solo actualizar si el estado cambió
    if (nuevoEstado && nuevoEstado !== activePedido.estado) {
      handleUpdatePedidoEstado(activeId, nuevoEstado);
    }
  };

  // Vista Kanban
  const KanbanView = () => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DroppableColumn
          id="pendiente"
          title="Pendientes"
          pedidos={pedidosByEstado.pendiente}
          color="yellow"
        >
          No hay pedidos pendientes
        </DroppableColumn>
        
        <DroppableColumn
          id="preparacion"
          title="En Preparación"
          pedidos={pedidosByEstado.preparacion}
          color="blue"
        >
          No hay pedidos en preparación
        </DroppableColumn>
        
        <DroppableColumn
          id="terminado"
          title="Terminados"
          pedidos={pedidosByEstado.terminado}
          color="green"
        >
          No hay pedidos terminados
        </DroppableColumn>
        
        <DroppableColumn
          id="cancelado"
          title="Cancelados"
          pedidos={pedidosByEstado.cancelado}
          color="red"
        >
          No hay pedidos cancelados
        </DroppableColumn>
      </div>

      <DragOverlay>
        {/* Aquí puedes agregar una vista previa del elemento que se está arrastrando */}
      </DragOverlay>
    </DndContext>
  );

  // Renderizado principal del componente
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-500 text-red-200 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <button
          onClick={loadPedidos}
          className="ml-4 bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda */}
      <SearchBar />

      {/* Vista principal */}
      {viewMode === "table" ? <TableView /> : <KanbanView />}

      {/* Paginación (solo para vista de tabla) */}
      {viewMode === "table" && <Pagination />}

      {/* Modal de confirmación de eliminación */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Confirmar eliminación</h3>
            <p className="text-gray-300 mb-6">
              ¿Estás seguro de que deseas eliminar el pedido #{pedidoToDelete?.id}?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Eliminar
              </button>
              <button
                onClick={() => {
                  setIsDeleting(false);
                  setPedidoToDelete(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de estado */}
      {showEstadoModal && (
        <CambiarEstadoModal
          isOpen={showEstadoModal}
          onClose={() => {
            setShowEstadoModal(false);
            setPedidoToChangeStatus(null);
          }}
          onConfirm={confirmChangeStatus}
          pedido={pedidoToChangeStatus}
          isUpdating={isUpdating}
        />
      )}

      {/* Modal de detalles del pedido */}
      {showDetail && (
        <PedidoDetailModal
          isOpen={!!showDetail}
          onClose={() => setShowDetail(null)}
          pedido={showDetail}
        />
      )}
    </div>
  );
};

export default PedidoList;