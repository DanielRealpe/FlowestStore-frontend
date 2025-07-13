"use client"

import { Edit } from "lucide-react"

const ClienteDetailModal = ({ cliente, onClose, onEdit }) => {
  // Formatear fecha de registro
  const formatDate = (dateString) => {
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
  const clienteDetails = [
    { label: "Nombre Completo", value: cliente.nombreCompleto },
    { label: "Documento", value: `${cliente.tipoDocumento}: ${cliente.documentoIdentidad}` },
    { label: "Correo Electrónico", value: cliente.correoElectronico },
    { label: "Teléfono", value: cliente.telefono },
    { label: "Dirección", value: cliente.direccion },
    { label: "Género", value: cliente.genero, capitalize: true },
    {
      label: "Fecha de Registro",
      value: formatDate(cliente.fechaRegistro),
    },
    {
      label: "Estado",
      value: cliente.estado,
      className: `font-medium capitalize ${cliente.estado === "activo" ? "text-green-400" : "text-red-400"}`,
    },
  ]

  // Componente para cada campo de detalle
  const DetailField = ({ label, value, className, capitalize }) => (
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={className || "text-white font-medium" + (capitalize ? " capitalize" : "")}>{value}</p>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl shadow-2xl w-[600px] border-2 border-orange-500 animate-fade-in">
        <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Detalles del Cliente</h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {clienteDetails.map((detail, index) => (
            <DetailField
              key={index}
              label={detail.label}
              value={detail.value}
              className={detail.className}
              capitalize={detail.capitalize}
            />
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onClose() // Primero cerramos el modal de detalles
              // Pequeño retraso para asegurar que el modal se cierre antes de abrir el de edición
              setTimeout(() => {
                onEdit() // Luego abrimos el modal de edición
              }, 100)
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 border border-orange-500"
          >
            <Edit size={16} />
            Editar
          </button>
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

export default ClienteDetailModal

