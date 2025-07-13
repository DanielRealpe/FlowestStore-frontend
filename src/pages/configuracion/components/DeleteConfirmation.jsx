"use client"
import { Check, X } from "lucide-react"

const DeleteConfirmation = ({ itemName, onConfirm, onCancel }) => {
  return (
    <div className="bg-red-900/20 p-3 flex items-center justify-between">
      <p className="text-white text-sm">
        ¿Estás seguro que deseas eliminar <span className="font-medium">{itemName}</span>?
      </p>
      <div className="flex space-x-2">
        <button
          onClick={onConfirm}
          className="p-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
        >
          <Check size={16} />
        </button>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all duration-200"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export default DeleteConfirmation
