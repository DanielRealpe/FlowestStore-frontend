"use client"

import { XCircle } from "lucide-react"

const DeleteConfirmModal = ({ onConfirm, onCancel, title, message }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium text-white">{title}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
            <XCircle size={24} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center mb-4 text-red-500">
            <XCircle size={48} />
          </div>
          <p className="text-center text-white">{message}</p>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal

