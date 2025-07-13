import { toast } from "react-toastify"
import { useState, useEffect } from "react"
import { Edit, Trash2, Search, RefreshCw, Eye, ChevronLeft, ChevronRight, DollarSign } from "lucide-react"
import { deleteInventario } from "../api/InventoryService.js"
import InventoryDetailModal from "../modals/InventoryDetailModal"
import DeleteConfirmModal from "../../categorias/modals/DeleteConfirmModal"

const InventoryList = ({ inventario = [], onEdit, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [showDetail, setShowDetail] = useState(null)
  const [actionError, setActionError] = useState("")

  const itemsPerPage = 5

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const inventarioArray = Array.isArray(inventario) ? inventario : []

  const filteredInventario = inventarioArray.filter((item) => {
    return [
      item?.nombre_producto || "",
      item?.codigo || "",
      item?.cantidad?.toString() || "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(debouncedSearchTerm.toLowerCase())
  })

  // Formato para precios
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Formato para fechas
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const totalPages = Math.ceil(filteredInventario.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedInventario = filteredInventario.slice(startIndex, startIndex + itemsPerPage)

  const handleDeleteClick = (item) => {
    setItemToDelete(item)
    setIsDeleting(true)
    setActionError("")
  }

  const confirmDelete = async () => {
    try {
      setActionError("")
      await deleteInventario(itemToDelete.id)
      toast.success(`Item de inventario eliminado exitosamente`)
      if (typeof onRefresh === "function") {
        onRefresh()
      }
      setIsDeleting(false)
      setItemToDelete(null)
    } catch (error) {
      console.error("Error al eliminar item:", error)
      setActionError(error.message || "Error al eliminar item")
    }
  }

  const handleRefresh = () => {
    setSearchTerm("")
    if (typeof onRefresh === "function") {
      onRefresh()
    }
  }

  return (
    <div>
      {actionError && (
        <div className="bg-red-900 text-white p-3 rounded-lg mb-4 animate-pulse border border-red-500 text-sm">
          {actionError}
        </div>
      )}

      <div className="flex items-center mb-6 bg-gray-900 border border-gray-700 rounded-lg p-2">
        <Search className="text-gray-400 ml-2" size={20} />
        <input
          type="text"
          placeholder="Buscar en inventario..."
          className="w-full bg-transparent border-none text-white focus:outline-none px-3 py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={handleRefresh}
          className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
          title="Refrescar"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="overflow-x-auto bg-gray-900 rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Precio Compra</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Precio Venta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Última Modificación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {paginatedInventario.length > 0 ? (
              paginatedInventario.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 text-gray-300 text-sm font-mono">{item.codigo}</td>
                  <td className="px-6 py-4 text-white text-sm">{item.nombre_producto}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm text-center">{item.cantidad}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    {formatPrice(item.precio_compra)}
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    {formatPrice(item.precio_venta)}
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    {formatDate(item.fecha_ultima_modificacion)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowDetail(item)}
                        className="text-blue-400 hover:text-blue-300"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="text-orange-500 hover:text-orange-400"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="text-red-500 hover:text-red-400"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-400">
                  No se encontraron items en el inventario
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-300">
              Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredInventario.length)} de{" "}
              {filteredInventario.length} items
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-white border border-gray-600 p-2 rounded disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? "bg-orange-600 text-white border border-orange-500"
                      : "text-white border border-gray-600 hover:bg-gray-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="text-white border border-gray-600 p-2 rounded disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetail && (
        <InventoryDetailModal
          item={showDetail}
          onClose={() => setShowDetail(null)}
          onEdit={() => {
            setShowDetail(null)
            setTimeout(() => {
              onEdit(showDetail)
            }, 100)
          }}
        />
      )}

      {isDeleting && (
        <DeleteConfirmModal
          title="Eliminar Item de Inventario"
          message={`¿Estás seguro de eliminar este item del inventario? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => {
            setIsDeleting(false)
            setItemToDelete(null)
            setActionError("")
          }}
          isLoading={false}
        />
      )}
    </div>
  )
}

export default InventoryList