"use client"

import { Trash2 } from "lucide-react"

const DeleteConfirmModal = ({
  item,
  onConfirm,
  onCancel,
  itemName = "item",
  itemField = "name",
  isLoading = false,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl shadow-2xl w-96 border-2 border-red-500 animate-fade-in">
        <div className="flex items-center mb-4 text-red-500">
          <Trash2 size={24} className="mr-2" />
          <h3 className="text-xl font-bold text-white">Confirmar eliminación</h3>
        </div>

        <p className="text-gray-300 mb-6">
          ¿Estás seguro de que deseas eliminar {itemName}{" "}
          <span className="font-semibold text-red-400">{item?.[itemField]}</span>? Esta acción no se puede deshacer.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors border border-red-500 flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-2" />
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
