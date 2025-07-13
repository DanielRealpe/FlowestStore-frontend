"use client"

import { X, User, Mail, Shield, Calendar, CreditCard, CheckCircle, AlertCircle } from "lucide-react"

const UserDetailModal = ({ usuario, onClose, renderRol, roles }) => {
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

  // // Función para renderizar el rol del usuario
  // const renderRol = (rolId) => {
  //   switch (rolId) {
  //     case 1:
  //       return <span className="bg-purple-900 text-purple-300 px-2 py-1 rounded-full text-xs">Administrador</span>
  //     case 2:
  //       return <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded-full text-xs">Empleado</span>
  //     case 3:
  //       return <span className="bg-green-900 text-green-300 px-2 py-1 rounded-full text-xs">Cliente</span>
  //     default:
  //       return <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">Sin rol</span>
  //   }
  // }

  // Datos a mostrar en el modal
  const usuarioDetails = [
    {
      label: "Nombre Completo",
      value: usuario.nombre,
      icon: <User size={16} className="mr-1 text-orange-400" />,
    },
    {
      label: "Correo Electrónico",
      value: usuario.email,
      icon: <Mail size={16} className="mr-1 text-orange-400" />,
    },
    {
      label: "Cédula",
      value: usuario.cedula || "No registrada",
      icon: <CreditCard size={16} className="mr-1 text-orange-400" />,
    },
    {
      label: "Rol",
      value: renderRol(usuario.id_rol, roles),
      icon: <Shield size={16} className="mr-1 text-orange-400" />,
      isComponent: true,
    },
    {
      label: "Estado",
      value: usuario.estado === "activo" ? "Activo" : "Inactivo",
      icon:
        usuario.estado === "activo" ? (
          <CheckCircle size={16} className="mr-1 text-green-400" />
        ) : (
          <AlertCircle size={16} className="mr-1 text-red-400" />
        ),
      className: usuario.estado === "activo" ? "text-green-400" : "text-red-400",
    },
    {
      label: "Fecha de Registro",
      value: formatDate(usuario.fechaRegistro),
      icon: <Calendar size={16} className="mr-1 text-orange-400" />,
    },
  ]

  // Componente para cada campo de detalle
  const DetailField = ({ label, value, className, icon, isComponent }) => (
    <div className="mb-4">
      <p className="text-gray-400 text-sm">{label}</p>
      {isComponent ? (
        <div className="flex items-center mt-1">
          {icon && icon}
          {value}
        </div>
      ) : (
        <p className={`${className || "text-white"} font-medium flex items-center mt-1`}>
          {icon && icon}
          {value}
        </p>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl shadow-2xl w-[600px] border-2 border-orange-500 animate-fade-in">
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
          <h3 className="text-xl font-bold text-white flex items-center">
            <div className="bg-orange-500 p-2 rounded-lg mr-2">
              <User className="h-5 w-5 text-white" />
            </div>
            Detalles del Usuario
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:rotate-90 transition-all bg-gray-800 p-1.5 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {usuarioDetails.map((detail, index) => (
            <DetailField
              key={index}
              label={detail.label}
              value={detail.value}
              className={detail.className}
              icon={detail.icon}
              isComponent={detail.isComponent}
            />
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserDetailModal
