"use client"

import { Trash2, X } from "lucide-react"
import { useTheme } from "../../../components/layout/ThemeContext.jsx"

const DeleteConfirmModal = ({ onConfirm, onCancel, title, message }) => {
  const { darkMode } = useTheme()

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/20 via-black/40 to-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl shadow-xl w-full max-w-md transform transition-all border-t-4 border-red-500 ${
        darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border-slate-200"
      }`}>
        <div className="flex justify-between items-start p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-full mr-4 ${darkMode ? "bg-red-900/30" : "bg-red-100"}`}>
              <Trash2 className={`h-6 w-6 ${darkMode ? "text-red-400" : "text-red-600"}`} />
            </div>
            <div>
              <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
                {title || "Confirmar Eliminación"}
              </h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            className={`p-2 -mt-2 -mr-2 rounded-full transition-all ${
              darkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-6">
          <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-slate-600"}`}>
            {message || "¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer."}
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={`px-6 py-2.5 rounded-lg border transition-all duration-200 disabled:opacity-50 ${
              darkMode
                ? "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-white transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              isLoading
                ? darkMode
                  ? "bg-gray-600"
                  : "bg-slate-400"
                : "bg-red-600 hover:bg-red-700 shadow-red-500/20 hover:shadow-red-500/30"
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 size={18} />
            )}
            {isLoading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal

