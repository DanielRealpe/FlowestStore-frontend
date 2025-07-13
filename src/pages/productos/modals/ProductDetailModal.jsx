"use client"

import { Edit, ImageIcon, DollarSign, TagIcon } from "lucide-react"

const ProductoDetailModal = ({ producto, onClose, onEdit }) => {
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

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Datos a mostrar en el modal
  const productoDetails = [
    { label: "Nombre", value: producto.nombre },
    { label: "Descripción", value: producto.descripcion || "Sin descripción" },
    {
      label: "Categoría",
      value: producto.categoria?.nombre || "Sin categoría",
      icon: <TagIcon size={16} className="mr-1 text-orange-400" />,
    },
    {
      label: "Precio",
      value: formatPrice(producto.precio),
      icon: <DollarSign size={16} className="mr-1 text-green-400" />,
    },
    {
      label: "Fecha de Creación",
      value: formatDate(producto.createdAt),
    },
    {
      label: "Estado",
      value: producto.estado === "activo" ? "Activo" : "Inactivo",
      className: `font-medium capitalize ${producto.estado === "activo" ? "text-green-400" : "text-red-400"}`,
    },
  ]

  // Componente para cada campo de detalle
  const DetailField = ({ label, value, className, icon }) => (
    <div className="mb-3">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={className || "text-white font-medium flex items-center"}>
        {icon && icon}
        {value}
      </p>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl shadow-2xl w-[600px] border-2 border-orange-500 animate-fade-in">
        <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Detalles del Producto</h3>

        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="md:w-1/3">
            <div className="bg-gray-800 rounded-lg h-48 flex items-center justify-center overflow-hidden border border-gray-700">
              {producto.imagenUrl ? (
                <img
                  src={producto.imagenUrl || "/placeholder.svg"}
                  alt={producto.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-gray-400">
                  <ImageIcon size={48} className="mx-auto mb-2" />
                  <p>Sin imagen</p>
                </div>
              )}
            </div>
          </div>

          <div className="md:w-2/3">
            {productoDetails.map((detail, index) => (
              <DetailField
                key={index}
                label={detail.label}
                value={detail.value}
                className={detail.className}
                icon={detail.icon}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onEdit}
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

export default ProductoDetailModal
