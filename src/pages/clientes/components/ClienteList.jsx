import { useState, useEffect } from "react"
import {
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { toast } from "react-toastify"
import { deleteCliente, toggleClienteEstado } from "../api/clienteService"
import ClienteDetailModal from "../modals/ClienteDetailModal"
import DeleteConfirmModal from "../modals/DeleteConfirmModal"
import { useTheme } from "../../../components/layout/ThemeContext.jsx" // Importar el contexto de tema

const ClienteList = ({ clientes = [], onEdit, onDelete, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)
  const [clienteToDelete, setClienteToDelete] = useState(null)
  const [showDetail, setShowDetail] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [actionError, setActionError] = useState("")

  // Usar el contexto de tema
  const { darkMode } = useTheme()

  const itemsPerPage = 5

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (Array.isArray(clientes) && clientes.length > 0) {
      const maxPage = Math.ceil(clientes.length / itemsPerPage)
      if (currentPage > maxPage) {
        setCurrentPage(maxPage)
      }
    }
  }, [clientes, currentPage, itemsPerPage])

  const clientesArray = Array.isArray(clientes) ? clientes : []

  const filteredClientes = clientesArray.filter((cliente) =>
    [cliente?.nombreCompleto || "", cliente?.documentoIdentidad || "", cliente?.correoElectronico || ""]
      .join(" ")
      .toLowerCase()
      .includes(debouncedSearchTerm.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedClientes = filteredClientes.slice(startIndex, startIndex + itemsPerPage)

  const handleDeleteClick = (cliente) => {
    setClienteToDelete(cliente)
    setIsDeleting(true)
    setActionError("")
  }

  const confirmDelete = async () => {
    try {
      setActionError("")
      await deleteCliente(clienteToDelete.id)
      toast.success(`Cliente ${clienteToDelete.nombreCompleto} eliminado exitosamente`)
      if (typeof onDelete === "function") {
        onDelete()
      }
      setIsDeleting(false)
      setClienteToDelete(null)
    } catch (error) {
      const msg = error.message || "Error al eliminar cliente"
      setActionError(msg)
      toast.error(msg)
    }
  }

  const handleToggleEstado = async (cliente) => {
    try {
      setIsUpdating(true)
      setActionError("")
      await toggleClienteEstado(cliente.id, cliente.estado)
      toast.success(
        `Cliente ${cliente.nombreCompleto} ${cliente.estado === "activo" ? "desactivado" : "activado"} correctamente`
      )
      if (typeof onRefresh === "function") {
        onRefresh()
      }
    } catch (error) {
      const msg = error.message || "Error al cambiar estado del cliente"
      setActionError(msg)
      toast.error(msg)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEditClick = (cliente) => {
    if (onEdit && typeof onEdit === "function") {
      onEdit(cliente)
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
        <div className={`p-3 rounded-lg mb-4 border text-sm ${
          darkMode 
            ? 'bg-red-900/20 text-red-300 border-red-500/30' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {actionError}
        </div>
      )}

      {/* Búsqueda */}
      <div className={`flex items-center mb-6 border rounded-lg p-2 ${
        darkMode 
          ? 'bg-gray-800 border-gray-600' 
          : 'bg-white border-slate-300'
      }`}>
        <Search className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-slate-400'}`} size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre, documento o correo..."
          className={`w-full bg-transparent border-none focus:outline-none px-3 py-2 ${
            darkMode ? 'text-white placeholder-gray-400' : 'text-slate-900 placeholder-slate-500'
          }`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className={`overflow-x-auto rounded-lg border ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-slate-200'
      }`}>
        <table className="min-w-full divide-y divide-gray-600">
          <thead className={darkMode ? 'bg-gray-700' : 'bg-slate-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                darkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>Nombre</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                darkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>Documento</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                darkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>Correo</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                darkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>Teléfono</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                darkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>Estado</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                darkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>Acciones</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            darkMode 
              ? 'bg-gray-800 divide-gray-700' 
              : 'bg-white divide-slate-200'
          }`}>
            {paginatedClientes.length > 0 ? (
              paginatedClientes.map((cliente) => (
                <tr key={cliente.id} className={`transition-colors ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50'
                }`}>
                  <td className={`px-6 py-4 text-sm font-medium ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {cliente.nombreCompleto}
                  </td>
                  <td className={`px-6 py-4 text-sm ${
                    darkMode ? 'text-gray-300' : 'text-slate-600'
                  }`}>
                    {cliente.tipoDocumento}: {cliente.documentoIdentidad}
                  </td>
                  <td className={`px-6 py-4 text-sm ${
                    darkMode ? 'text-gray-300' : 'text-slate-600'
                  }`}>
                    {cliente.correoElectronico}
                  </td>
                  <td className={`px-6 py-4 text-sm ${
                    darkMode ? 'text-gray-300' : 'text-slate-600'
                  }`}>
                    {cliente.telefono}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleEstado(cliente)}
                      disabled={isUpdating}
                      className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full border transition-colors ${
                        cliente.estado === "activo"
                          ? darkMode 
                            ? "bg-green-900/30 text-green-300 border-green-500/50 hover:bg-green-900/50"
                            : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          : darkMode
                            ? "bg-red-900/30 text-red-300 border-red-500/50 hover:bg-red-900/50"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      }`}
                      title={`Cambiar a ${cliente.estado === "activo" ? "inactivo" : "activo"}`}
                    >
                      {cliente.estado === "activo" ? (
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
                        onClick={() => setShowDetail(cliente)}
                        className={`p-1 rounded transition-colors ${
                          darkMode 
                            ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                            : 'text-blue-600 hover:text-blue-500 hover:bg-blue-50'
                        }`}
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditClick(cliente)}
                        className={`p-1 rounded transition-colors ${
                          darkMode 
                            ? 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20' 
                            : 'text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50'
                        }`}
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cliente)}
                        className={`p-1 rounded transition-colors ${
                          darkMode 
                            ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                            : 'text-red-600 hover:text-red-500 hover:bg-red-50'
                        }`}
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
                <td colSpan="6" className={`px-6 py-8 text-center ${
                  darkMode ? 'text-gray-400' : 'text-slate-500'
                }`}>
                  <div className="flex flex-col items-center">
                    <Users size={48} className={`mb-2 ${darkMode ? 'text-gray-600' : 'text-slate-300'}`} />
                    <p className="text-lg font-semibold mb-1">No se encontraron clientes</p>
                    <p className="text-sm">Intenta con otros términos de búsqueda</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className={`mt-6 rounded-lg border p-4 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
              Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredClientes.length)} de{" "}
              {filteredClientes.length} clientes
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`border p-2 rounded transition-colors disabled:opacity-50 ${
                  darkMode 
                    ? 'text-white border-gray-600 hover:bg-gray-700 disabled:hover:bg-transparent' 
                    : 'text-slate-700 border-slate-300 hover:bg-slate-50 disabled:hover:bg-transparent'
                }`}
              >
                <ChevronLeft size={18} />
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`border p-2 rounded transition-colors disabled:opacity-50 ${
                  darkMode 
                    ? 'text-white border-gray-600 hover:bg-gray-700 disabled:hover:bg-transparent' 
                    : 'text-slate-700 border-slate-300 hover:bg-slate-50 disabled:hover:bg-transparent'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded transition-colors ${
                    currentPage === i + 1
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border border-indigo-500"
                      : darkMode
                        ? "text-white border border-gray-600 hover:bg-gray-700"
                        : "text-slate-700 border border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`border p-2 rounded transition-colors disabled:opacity-50 ${
                  darkMode 
                    ? 'text-white border-gray-600 hover:bg-gray-700 disabled:hover:bg-transparent' 
                    : 'text-slate-700 border-slate-300 hover:bg-slate-50 disabled:hover:bg-transparent'
                }`}
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`border p-2 rounded transition-colors disabled:opacity-50 ${
                  darkMode 
                    ? 'text-white border-gray-600 hover:bg-gray-700 disabled:hover:bg-transparent' 
                    : 'text-slate-700 border-slate-300 hover:bg-slate-50 disabled:hover:bg-transparent'
                }`}
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
        <ClienteDetailModal
          cliente={showDetail}
          onClose={() => setShowDetail(null)}
          onEdit={() => {
            setShowDetail(null)
            setTimeout(() => {
              handleEditClick(showDetail)
            }, 100)
          }}
        />
      )}

      {isDeleting && (
        <DeleteConfirmModal
          cliente={clienteToDelete}
          onConfirm={confirmDelete}
          onCancel={() => {
            setIsDeleting(false)
            setClienteToDelete(null)
            setActionError("")
          }}
        />
      )}
    </div>
  )
}

export default ClienteList