"use client"

import { useState } from "react"
import { Clock, Utensils, CheckCircle, XCircle, X } from "lucide-react"
import { useTheme } from "../../../components/layout/ThemeContext.jsx"

const CambiarEstadoModal = ({ pedido, onConfirm, onClose, isLoading }) => {
  const { darkMode } = useTheme()
  const [selectedEstado, setSelectedEstado] = useState(pedido.estado)

  const estados = [
    {
      value: "pendiente",
      label: "Pendiente",
      icon: <Clock className="h-5 w-5" />,
      color: darkMode 
        ? "bg-yellow-900/30 border-yellow-500/50 text-yellow-300"
        : "bg-yellow-50 border-yellow-200 text-yellow-700",
      description: "El pedido está registrado pero aún no se ha comenzado a preparar.",
    },
    {
      value: "preparacion",
      label: "En Preparación",
      icon: <Utensils className="h-5 w-5" />,
      color: darkMode 
        ? "bg-blue-900/30 border-blue-500/50 text-blue-300"
        : "bg-blue-50 border-blue-200 text-blue-700",
      description: "El pedido está siendo preparado en cocina.",
    },
    {
      value: "terminado",
      label: "Terminado",
      icon: <CheckCircle className="h-5 w-5" />,
      color: darkMode 
        ? "bg-green-900/30 border-green-500/50 text-green-300"
        : "bg-green-50 border-green-200 text-green-700",
      description: "El pedido ha sido entregado al cliente.",
    },
    {
      value: "cancelado",
      label: "Cancelado",
      icon: <XCircle className="h-5 w-5" />,
      color: darkMode 
        ? "bg-red-900/30 border-red-500/50 text-red-300"
        : "bg-red-50 border-red-200 text-red-700",
      description: "El pedido ha sido cancelado.",
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl shadow-xl w-full max-w-md transform transition-all ${
  darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border-slate-200"
}`}>
        <div className={`flex justify-between items-center p-6 border-b ${darkMode ? "border-gray-700" : "border-slate-200"}`}>
          <h2 className={`text-xl font-semibold flex items-center gap-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-lg shadow-lg">
              <Clock size={18} />
            </span>
            Cambiar Estado del Pedido #{pedido.id}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-all ${
  darkMode 
    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" 
    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
}`}
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-300 mb-4">
          Selecciona el nuevo estado para el pedido de{" "}
          <span className="font-semibold text-white">{pedido.Cliente?.nombrecompleto}</span>
        </p>

        <div className="grid grid-cols-1 gap-3 mb-6">
          {estados.map((estado) => (
            <button
              key={estado.value}
              onClick={() => setSelectedEstado(estado.value)}
              className={`p-4 rounded-lg border flex items-start transition-all ${
  selectedEstado === estado.value
    ? `${estado.color} ring-2 ring-offset-2 ring-offset-${darkMode ? 'gray-800' : 'white'} ring-indigo-500`
    : darkMode
      ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
}`}
            >
              <div className="mr-3 mt-1">{estado.icon}</div>
              <div className="text-left">
                <h4 className="font-medium">{estado.label}</h4>
                <p className="text-sm opacity-80">{estado.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className={`flex justify-end space-x-3 pt-4 border-t ${darkMode ? "border-gray-700" : "border-slate-200"}`}>
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-lg border transition-all duration-200 ${
              darkMode
                ? "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(selectedEstado)}
            disabled={isLoading}
            className={`px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 
      text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 
      shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30
      ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2 inline-block"></span>
                Procesando...
              </>
            ) : (
              "Confirmar Cambio"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CambiarEstadoModal
