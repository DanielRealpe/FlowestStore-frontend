"use client"

import { useState } from "react"
import { useAuth } from "../../pages/usuarios/context/AuthContext"
import { MoreVertical, Edit, Trash2, Eye } from "lucide-react"

/**
 * Menú de acciones con permisos
 * @param {Function} onView - Función para ver detalles
 * @param {Function} onEdit - Función para editar
 * @param {Function} onDelete - Función para eliminar
 * @param {string} recurso - Recurso (ej: "productos")
 */
const ActionsMenu = ({ onView, onEdit, onDelete, recurso }) => {
  const { user, hasPermission } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Verificar permisos
  const canView = user && (user.id_rol === 1 || hasPermission(recurso, "ver"))
  const canEdit = user && (user.id_rol === 1 || hasPermission(recurso, "editar"))
  const canDelete = user && user.id_rol === 1 // Solo admin puede eliminar

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <div className="relative">
      <button onClick={toggleMenu} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Acciones">
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar el menú al hacer clic fuera */}
          <div className="fixed inset-0 z-10" onClick={closeMenu}></div>

          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-20 py-1 border border-gray-700">
            {canView && onView && (
              <button
                onClick={() => {
                  onView()
                  closeMenu()
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
              >
                <Eye size={16} className="mr-2 text-blue-400" />
                Ver detalles
              </button>
            )}

            {canEdit && onEdit && (
              <button
                onClick={() => {
                  onEdit()
                  closeMenu()
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
              >
                <Edit size={16} className="mr-2 text-yellow-400" />
                Editar
              </button>
            )}

            {canDelete && onDelete && (
              <button
                onClick={() => {
                  onDelete()
                  closeMenu()
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
              >
                <Trash2 size={16} className="mr-2 text-red-400" />
                Eliminar
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ActionsMenu
