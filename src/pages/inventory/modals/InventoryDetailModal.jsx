import { Edit } from "lucide-react"

const InventoryDetailModal = ({ item, onClose, onEdit }) => {
  // Formatear fecha
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

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Datos a mostrar en el modal
  const inventoryDetails = [
    { label: "Producto", value: item.producto?.nombre || "No disponible" },
    { label: "Cantidad", value: item.cantidad },
    { label: "Ubicación", value: item.ubicacion },
    { label: "Lote", value: item.lote },
    { label: "Fecha de Vencimiento", value: formatDate(item.fechaVencimiento) },
    { label: "Precio Unitario", value: formatPrice(item.producto?.precio || 0) },
    { label: "Categoría", value: item.producto?.Categorium?.nombre || "Sin categoría" },
    {
      label: "Estado",
      value: item.estado,
      className: `font-medium capitalize ${
        item.estado === "activo" ? "text-green-400" : "text-red-400"
      }`,
    },
    { 
      label: "Valor Total", 
      value: formatPrice((item.cantidad || 0) * (item.producto?.precio || 0)),
      className: "text-orange-400 font-bold"
    },
  ]

  // Componente para cada campo de detalle
  const DetailField = ({ label, value, className }) => (
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={className || "text-white font-medium"}>{value}</p>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl shadow-2xl w-[600px] border-2 border-orange-500 animate-fade-in">
        <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">
          Detalles del Item de Inventario
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {inventoryDetails.map((detail, index) => (
            <DetailField
              key={index}
              label={detail.label}
              value={detail.value}
              className={detail.className}
            />
          ))}
        </div>

        {item.notas && (
          <div className="mb-6">
            <p className="text-gray-400 text-sm">Notas</p>
            <p className="text-white bg-gray-800 p-3 rounded-lg border border-gray-700">
              {item.notas}
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onClose()
              setTimeout(() => {
                onEdit()
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

export default InventoryDetailModal