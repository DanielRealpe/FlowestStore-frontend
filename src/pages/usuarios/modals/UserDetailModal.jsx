"use client"

import { X, User, Mail, Shield, Calendar, CreditCard, CheckCircle, AlertCircle } from "lucide-react"
import { useTheme } from "../../../components/layout/ThemeContext.jsx" // Asegúrate que la ruta sea correcta

const UserDetailModal = ({ usuario, onClose, renderRol, roles }) => {
  const { darkMode } = useTheme()

  // Formatear fecha de registro (si existe)
  const formatDate = (dateString) => {
    if (!dateString) return "No registrada"
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch (error) {
      console.error("Error al formatear la fecha:", error)
      return "Fecha no disponible"
    }
  }

  // Datos a mostrar en el modal
  const usuarioDetails = [
    {
      label: "Nombre Completo",
      value: usuario.nombre,
      icon: <User size={16} />,
    },
    {
      label: "Correo Electrónico",
      value: usuario.email,
      icon: <Mail size={16} />,
    },
    {
      label: "Cédula",
      value: usuario.cedula || "No registrada",
      icon: <CreditCard size={16} />,
    },
    {
      label: "Rol",
      value: renderRol(usuario.id_rol, roles),
      icon: <Shield size={16} />,
      isComponent: true,
    },
    {
      label: "Estado",
      value: usuario.estado === "activo" ? "Activo" : "Inactivo",
      isStatus: true,
    },
    {
      label: "Fecha de Registro",
      value: formatDate(usuario.fechaRegistro),
      icon: <Calendar size={16} />,
    },
  ]

  // Componente para cada campo de detalle
  const DetailField = ({ label, value, isStatus, isComponent, icon }) => (
    <div>
      <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{label}</p>
      <div
        className={`flex items-center gap-2 font-medium ${
          isStatus
            ? usuario.estado === "activo"
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
        {isStatus ? (
          usuario.estado === "activo" ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )
        ) : (
          icon && <span className={darkMode ? "text-gray-400" : "text-slate-500"}>{icon}</span>
        )}
        <span>{value}</span>
      </div>
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
            Detalles del Usuario
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
            {usuarioDetails.map((detail) => (
              <DetailField
                key={detail.label}
                label={detail.label}
                value={detail.value}
                isStatus={detail.isStatus}
                isComponent={detail.isComponent}
                icon={detail.icon}
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetailModal