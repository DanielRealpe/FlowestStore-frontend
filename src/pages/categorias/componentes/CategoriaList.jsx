"use client"
import { toast } from "react-toastify"
import { useState, useEffect } from "react"
import { Edit, Trash2, Search, RefreshCw, Eye, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight } from "lucide-react"
import { deleteCategoria, toggleCategoriaEstado } from "../api/categoriaService"
import CategoriaDetailModal from "../modals/CategoriaDetailModal"
import DeleteConfirmModal from "../modals/DeleteConfirmModal"

const CategoriaList = ({ categorias = [], onEdit, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)
  const [categoriaToDelete, setCategoriaToDelete] = useState(null)
  const [showDetail, setShowDetail] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [actionError, setActionError] = useState("")

  const itemsPerPage = 5

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 2000)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Cuando cambian las categorías, asegurarse de que la página actual sea válida
  useEffect(() => {
    if (Array.isArray(categorias) && categorias.length > 0) {
      const maxPage = Math.ceil(categorias.length / itemsPerPage)
      if (currentPage > maxPage) {
        setCurrentPage(maxPage)
      }
    }
  }, [categorias, currentPage, itemsPerPage])

  // Asegurarnos de que categorias sea siempre un array
  const categoriasArray = Array.isArray(categorias) ? categorias : []

  const filteredCategorias = categoriasArray.filter((categoria) =>
    [categoria?.nombre || "", categoria?.descripcion || ""]
      .join(" ")
      .toLowerCase()
      .includes(debouncedSearchTerm.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredCategorias.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCategorias = filteredCategorias.slice(startIndex, startIndex + itemsPerPage)

  const handleDeleteClick = (categoria) => {
    setCategoriaToDelete(categoria)
    setIsDeleting(true)
    setActionError("")
  }

  const confirmDelete = async () => {
    try {
      setActionError("")
      await deleteCategoria(categoriaToDelete.id)
      toast.success(`Categoría ${categoriaToDelete.nombre} eliminada exitosamente`)
      if (typeof onRefresh === "function") {
        onRefresh()
      }
      setIsDeleting(false)
      setCategoriaToDelete(null)
    } catch (error) {
      console.error("Error al eliminar categoría:", error)
      setActionError(error.message || "Error al eliminar categoría")
    }
  }

  const handleToggleEstado = async (categoria) => {
    try {
      setIsUpdating(true)
      setActionError("")
      await toggleCategoriaEstado(categoria.id, categoria.estado)
      toast.success(
        `Categoría ${categoria.nombre} ${categoria.estado === "activo" ? "inactivo" : "activo"} correctamente`)
      if (typeof onRefresh === "function") {
        onRefresh()
      }
    } catch (error) {
      console.error("Error al cambiar estado de la categoría:", error)
      setActionError(error.message || "Error al cambiar estado de la categoría")
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {paginatedCategorias.length > 0 ? (
              paginatedCategorias.map((categoria) => (
                <tr key={categoria.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 text-white text-sm">{categoria.nombre}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    {categoria.descripcion ? (
                      categoria.descripcion.length > 50 ? (
                        `${categoria.descripcion.substring(0, 50)}...`
                      ) : (
                        categoria.descripcion
                      )
                    ) : (
                      <span className="text-gray-500">Sin descripción</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleEstado(categoria)}
                      disabled={isUpdating}
                      className={`px-2 inline-flex items-center text-xs font-semibold rounded-full ${
                        categoria.estado === "activo"
                          ? "bg-green-900 text-green-300 border border-green-500 hover:bg-green-800"
                          : "bg-red-900 text-red-300 border border-red-500 hover:bg-red-800"
                      }`}
                      title={`Cambiar a ${!categoria.estado? "inactivo" : "activo"}`}
                    >
                      {categoria.estado == "activo"? (
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
                        onClick={() => setShowDetail(categoria)}
                        className="text-blue-400 hover:text-blue-300"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(categoria)}
                        className="text-orange-500 hover:text-orange-400"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(categoria)}
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
                <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                  No se encontraron categorías
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
              Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredCategorias.length)} de{" "}
              {filteredCategorias.length} categorías
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
        <CategoriaDetailModal
          categoria={showDetail}
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
          item={categoriaToDelete}
          itemName="la categoría"
          itemField="nombre"
          onConfirm={confirmDelete}
          onCancel={() => {
            setIsDeleting(false)
            setCategoriaToDelete(null)
            setActionError("")
          }}
        />
      )}
    </div>
  )
}

export default CategoriaList