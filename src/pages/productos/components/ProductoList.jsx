"use client"
import { toast } from "react-toastify"
import { useState, useEffect } from "react"
import { Edit, Trash2, Search, RefreshCw, Eye, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight } from "lucide-react"
import { deleteProducto, toggleProductoEstado } from "../api/ProductoService"
import ProductoDetailModal from "../modals/ProductDetailModal"
import DeleteConfirmModal from "../../categorias/modals/DeleteConfirmModal"

const ProductoList = ({ productos = [], onEdit, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)
  const [productoToDelete, setProductoToDelete] = useState(null)
  const [showDetail, setShowDetail] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [actionError, setActionError] = useState("")

  // Cambiar de 10 a 5 productos por página
  const itemsPerPage = 5

  useEffect(() => {
    console.log(productos)
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Cuando cambian los productos, asegurarse de que la página actual sea válida
  useEffect(() => {
    if (Array.isArray(productos) && productos.length > 0) {
      const maxPage = Math.ceil(productos.length / itemsPerPage)
      if (currentPage > maxPage) {
        setCurrentPage(maxPage)
      }
    }
  }, [productos, currentPage, itemsPerPage])

  // Asegurarnos de que productos sea siempre un array
  const productosArray = Array.isArray(productos) ? productos : []

  const filteredProductos = productosArray.filter((producto) => {
    console.log("Producto para filtrar:", producto) // Debug
    return [
      producto?.nombre || "",
      producto?.descripcion || "",
      producto?.categoria?.nombre || producto?.Categoria?.nombre || "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(debouncedSearchTerm.toLowerCase())
  })

  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProductos = filteredProductos.slice(startIndex, startIndex + itemsPerPage)

  const handleDeleteClick = (producto) => {
    setProductoToDelete(producto)
    setIsDeleting(true)
    setActionError("")
  }

  const confirmDelete = async () => {
    try {
      setActionError("")
      console.log("Eliminando producto:", productoToDelete)
      await deleteProducto(productoToDelete.id)
      toast.success(`Producto ${productoToDelete.nombre} eliminado exitosamente`)
      if (typeof onRefresh === "function") {
        onRefresh()
      }
      setIsDeleting(false)
      setProductoToDelete(null)
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      setActionError(error.message || "Error al eliminar producto")
    }
  }

  const handleToggleEstado = async (producto) => {
    try {
      setIsUpdating(true)
      setActionError("")
      await toggleProductoEstado(producto.id, producto.estado)
      toast.success(
        `producto ${producto.nombre} ${producto.estado === "activo" ? "desactivado" : "activado"} correctamente`,
      )
      if (typeof onRefresh === "function") {
        onRefresh()
      }
    } catch (error) {
      console.error("Error al cambiar estado del producto:", error)
      setActionError(error.message || "Error al cambiar estado del producto")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRefresh = () => {
    setSearchTerm("")
    if (typeof onRefresh === "function") {
      onRefresh()
    }
  }

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div>
      {/* Mensaje de error */}
      {actionError && (
        <div className="bg-red-900 text-white p-3 rounded-lg mb-4 animate-pulse border border-red-500 text-sm">
          {actionError}
        </div>
      )}

      {/* Búsqueda */}
      <div className="flex items-center mb-6 bg-gray-900 border border-gray-700 rounded-lg p-2">
        <Search className="text-gray-400 ml-2" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre..."
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

      {/* Tabla */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {paginatedProductos.length > 0 ? (
              paginatedProductos.map((producto) => (
                <tr key={producto.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 text-white text-sm">{producto.nombre}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    { producto.Categorium?.nombre || "Sin categoría"}
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{formatPrice(producto.precio)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleEstado(producto)}
                      disabled={isUpdating}
                      className={`px-2 inline-flex items-center text-xs font-semibold rounded-full ${
                        producto.estado === "activo"
                          ? "bg-green-900 text-green-300 border border-green-500 hover:bg-green-800"
                          : "bg-red-900 text-red-300 border border-red-500 hover:bg-red-800"
                      }`}
                      title={`Cambiar a ${producto.estado === "activo" ? "inactivo" : "activo"}`}
                    >
                      {producto.estado === "activo" ? (
                        <>
                          <ToggleRight size={16} className="mr-1" /> Activo
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={16} className="mr-1" /> Inactivo
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowDetail(producto)}
                        className="text-blue-400 hover:text-blue-300"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(producto)}
                        className="text-orange-500 hover:text-orange-400"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(producto)}
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
                <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                  No se encontraron productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-300">
              Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredProductos.length)} de{" "}
              {filteredProductos.length} productos
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="text-white border border-gray-600 p-2 rounded disabled:opacity-50"
              >
                <ChevronLeft size={18} />
                <ChevronLeft size={18} />
              </button>
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
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="text-white border border-gray-600 p-2 rounded disabled:opacity-50"
              >
                <ChevronRight size={18} />
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      {showDetail && (
        <ProductoDetailModal
          producto={showDetail}
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
          title="Eliminar Producto"
          message={`¿Estás seguro de eliminar el producto ${productoToDelete?.nombre}? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => {
            setIsDeleting(false)
            setProductoToDelete(null)
            setActionError("")
          }}
          isLoading={false}
        />
      )}
    </div>
  )
}

export default ProductoList
