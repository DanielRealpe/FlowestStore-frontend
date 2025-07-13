"use client"

import { Trash2 } from "lucide-react"

const DeleteConfirmModal = ({ title, message, onConfirm, onCancel, isLoading }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-red-500 animate-fade-in p-6">
        <div className="flex items-center mb-4">
          <div className="bg-red-500/20 p-3 rounded-full mr-3">
            <Trash2 className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-white">{title || "Confirmar Eliminación"}</h3>
        </div>

        <p className="text-gray-300 mb-6">
          {message || "¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer."}
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
