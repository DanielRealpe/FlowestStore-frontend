"use client"

import { Edit, User, X } from "lucide-react"
import { useTheme } from "../../../components/layout/ThemeContext.jsx" // Ajusta la ruta según tu estructura

const ClienteDetailModal = ({ cliente, onClose, onEdit }) => {
  const { darkMode } = useTheme()

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible"
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch (error) {
      console.error("Error al formatear la fecha:", error)
      return "Fecha inválida"
    }
  }

  const clienteDetails = [
    { label: "Nombre Completo", value: cliente.nombreCompleto },
    { label: "Documento", value: `${cliente.tipoDocumento}: ${cliente.documentoIdentidad}` },
    { label: "Correo Electrónico", value: cliente.correoElectronico },
    { label: "Teléfono", value: cliente.telefono },
    { label: "Dirección", value: cliente.direccion },
    { label: "Fecha de Registro", value: formatDate(cliente.fechaRegistro) },
    {
      label: "Estado",
      value: cliente.estado,
      isStatus: true,
    },
  ]

  const DetailField = ({ label, value, isStatus, capitalize }) => (
    <div>
      <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{label}</p>
      <p
        className={`font-medium ${capitalize ? "capitalize" : ""} ${
          isStatus
            ? cliente.estado === "activo"
              ? darkMode
                ? "text-green-400"
                : "text-green-600"
              : darkMode
                ? "text-red-400"
                : "text-red-600"
            : darkMode
              ? "text-white"
              : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-xl shadow-xl w-full max-w-2xl transform transition-all ${
          darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border-slate-200"
        }`}
      >
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${darkMode ? "border-gray-700" : "border-slate-200"}`}>
          <h2 className={`text-xl font-semibold flex items-center gap-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-lg shadow-lg">
              <User size={18} />
            </span>
            Detalles del Cliente
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-all ${
              darkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
            {clienteDetails.map((detail) => (
              <DetailField
                key={detail.label}
                label={detail.label}
                value={detail.value}
                isStatus={detail.isStatus}
                capitalize={detail.capitalize}
              />
            ))}
          </div>

          {/* Footer */}
          <div className={`flex justify-end space-x-3 pt-4 border-t ${darkMode ? "border-gray-700" : "border-slate-200"}`}>
            <button
              onClick={onClose}
              className={`px-6 py-2.5 rounded-lg border transition-all duration-200 ${
                darkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onClose()
                setTimeout(() => onEdit(), 100)
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
            >
              <Edit size={16} />
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClienteDetailModal