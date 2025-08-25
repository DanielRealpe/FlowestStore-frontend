"use client"

import { useState, useEffect } from "react"
import {
  Edit,
  Trash2,
  User,
  Shield,
  ToggleLeft,
  ToggleRight,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
} from "lucide-react"
import UserDetailModal from "../modals/UserDetailModal"
import { toggleUsuarioEstado, deleteUsuario, fetchRoles } from "../api/usuarioService"
import { toast } from "react-toastify"
import DeleteConfirmModal from "../../categorias/modals/DeleteConfirmModal"
import { useTheme } from "../../../components/layout/ThemeContext.jsx"

const UserList = ({ usuarios, onEdit, onRefresh, isAdmin }) => {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showDetailModal, setShowDetailModal] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [usuarioToDelete, setUsuarioToDelete] = useState(null)
  const [actionError, setActionError] = useState("")
  const itemsPerPage = 5
  const { darkMode } = useTheme()

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Filtrar usuarios por búsqueda
  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.cedula?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Paginación
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsuarios = filteredUsuarios.slice(startIndex, startIndex + itemsPerPage)

  // Función para renderizar el rol del usuario
  const renderRol = (rolId, rol) => {
    const rolcito = rol.find((rol) => rol.id == rolId)
    let colorClass = ""

    switch (rolId) {
      case 1:
        colorClass = "purple"
        break
      case 2:
        colorClass = "blue"
        break
      case 3:
        colorClass = "green"
        break
      default:
        colorClass = "gray"
        break
    }

    return (
      <span
        className={`bg-${colorClass}-900 text-${colorClass}-300 px-2 py-1 rounded-full text-xs`}
      >
        {rolcito?.nombre || "Desconocido"}
      </span>
    )
  }

  useEffect(() => {
    const cargarRoles = async () => {
      try {
        setLoading(true)
        const rolesData = await fetchRoles()
        setRoles(Array.isArray(rolesData) ? rolesData : [])
      } catch (error) {
        console.error("Error al cargar roles:", error)
        toast.error("Error al cargar roles: " + (error.message || "Error desconocido"))
        // Establecer roles vacíos para evitar errores en la interfaz
        setRoles([])
      } finally {
        setLoading(false)
      }
    }

    cargarRoles()
  }, [])

  const handleViewDetails = (usuario) => {
    setShowDetailModal(usuario)
  }

  // Función para cambiar el estado del usuario
  const handleToggleEstado = async (usuario) => {
    if (!isAdmin) return

    try {
      setLoadingStatus(usuario.id)
      setActionError("")

      // Llamar al servicio para cambiar el estado
      const nuevoEstado = usuario.estado === "activo" ? "inactivo" : "activo"
      await toggleUsuarioEstado(usuario.id, usuario.estado)

      // Mostrar notificación de éxito
      toast.success(`Usuario ${usuario.nombre} ${nuevoEstado === "activo" ? "activado" : "desactivado"} correctamente`)

      // Notificar al componente padre para actualizar la lista
      if (typeof onRefresh === "function") {
        onRefresh()
      }
    } catch (error) {
      console.error("Error al cambiar estado del usuario:", error)

      // Mensaje de error más descriptivo
      const errorMessage = error.message || "Error desconocido al cambiar estado"
      setActionError(errorMessage)
      toast.error(`Error al cambiar estado: ${errorMessage}`)
    } finally {
      setLoadingStatus(null)
    }
  }

  // Función para manejar el clic en eliminar
  const handleDeleteClick = (usuario) => {
    if (!isAdmin) return

    setUsuarioToDelete(usuario)
    setIsDeleting(true)
    setActionError("")
  }

  // Función para confirmar la eliminación
  const confirmDelete = async () => {
    try {
      setActionError("")
      console.log("Eliminando usuario:", usuarioToDelete)

      try {
        // Llamar al servicio para eliminar el usuario
        await deleteUsuario(usuarioToDelete.id)

        // Mostrar notificación de éxito
        toast.success(`Usuario ${usuarioToDelete.nombre} eliminado exitosamente`)

        // Notificar al componente padre para actualizar la lista
        if (typeof onRefresh === "function") {
          onRefresh()
        }
      } catch (error) {
        console.error("Error al eliminar usuario:", error)

        // Si el error tiene un mensaje específico del servidor, mostrarlo
        const errorMessage =
          error.response?.data?.mensaje ||
          error.response?.data?.error ||
          error.message ||
          "Error desconocido al eliminar usuario"

        setActionError(errorMessage)
        toast.error(`Error al eliminar usuario: ${errorMessage}`)

        // Si el error es 404 (no encontrado), podemos considerar que ya está eliminado
        if (error.response?.status === 404) {
          if (typeof onRefresh === "function") {
            onRefresh() // Actualizar la lista de todos modos
          }
        }
      }

      setIsDeleting(false)
      setUsuarioToDelete(null)
    } catch (error) {
      console.error("Error general al eliminar usuario:", error)
      setActionError("Error inesperado al procesar la solicitud")
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
          placeholder="Buscar por nombre, email o cédula..."
          className={`w-full bg-transparent border-none focus:outline-none px-3 py-2 ${
            darkMode ? 'text-white placeholder-gray-400' : 'text-slate-900 placeholder-slate-500'
          }`}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1) // Resetear a primera página al buscar
          }}
        />
        <button
          onClick={handleRefresh}
          className={`p-2 rounded transition-colors ${
            darkMode 
              ? 'text-gray-400 hover:text-indigo-300 hover:bg-indigo-900/20' 
              : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
          }`}
          title="Refrescar"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Tabla de usuarios */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className={darkMode ? 'bg-gray-700' : 'bg-slate-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                darkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>Nombre</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                darkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>Rol</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                darkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>Estado</th>
              <th className={`px-6 py-3 text-right text-xs font-medium uppercase ${
                darkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            darkMode 
              ? 'bg-gray-800 divide-gray-700' 
              : 'bg-white divide-slate-200'
          }`}>
            {loading == false ? (
              paginatedUsuarios.length > 0 ? (
                paginatedUsuarios.map((usuario) => (
                  <tr key={usuario.id} className={`transition-colors ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50'
                  }`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-indigo-400" />
                        {usuario.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-1 text-gray-400" />
                        {!loading ? renderRol(usuario.id_rol, roles) : "Cargando..."}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleEstado(usuario)}
                        disabled={!isAdmin || loadingStatus === usuario.id}
                        className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full border transition-colors ${
                          usuario.estado === "activo"
                            ? darkMode 
                              ? "bg-green-900/30 text-green-300 border-green-500/50 hover:bg-green-900/50"
                              : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            : darkMode
                              ? "bg-red-900/30 text-red-300 border-red-500/50 hover:bg-red-900/50"
                              : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        } ${!isAdmin || loadingStatus === usuario.id ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                        title={
                          isAdmin
                            ? `Cambiar a ${usuario.estado === "activo" ? "inactivo" : "activo"}`
                            : "No tienes permisos para cambiar el estado"
                        }
                      >
                        {loadingStatus === usuario.id ? (
                          <span className="flex items-center">
                            <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Cambiando...
                          </span>
                        ) : usuario.estado == "activo" ? (
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(usuario)}
                          className={`p-1 rounded transition-colors ${
                            darkMode 
                              ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                              : 'text-blue-600 hover:text-blue-500 hover:bg-blue-50'
                          }`}
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => onEdit(usuario)}
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
                              onClick={() => handleDeleteClick(usuario)}
                              className={`p-1 rounded transition-colors ${
                                darkMode 
                                  ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                                  : 'text-red-600 hover:text-red-500 hover:bg-red-50'
                              }`}
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className={`px-6 py-4 text-center ${
                    darkMode ? 'text-gray-400' : 'text-slate-500'
                  }`}>
                    No se encontraron usuarios
                  </td>
                </tr>
              )
            ) : (
              <tr>
                <td colSpan="4" className={`px-6 py-4 text-center ${
                  darkMode ? 'text-gray-400' : 'text-slate-500'
                }`}>
                  Cargando...
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
              Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredUsuarios.length)} de{" "}
              {filteredUsuarios.length} usuarios
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

      {/* Modal de detalles de usuario */}
      {showDetailModal && (
        <UserDetailModal
          usuario={showDetailModal}
          onClose={() => setShowDetailModal(null)}
          renderRol={renderRol}
          roles={roles}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {isDeleting && (
        <DeleteConfirmModal
          title="Eliminar Usuario"
          message={`¿Estás seguro de eliminar el usuario ${usuarioToDelete?.nombre}? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => {
            setIsDeleting(false)
            setUsuarioToDelete(null)
            setActionError("")
          }}
          isLoading={loadingStatus === usuarioToDelete?.id}
        />
      )}
    </div>
  )
}

export default UserList
