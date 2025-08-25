"use client"

import { Edit, X, Package, CheckCircle, AlertCircle, ImageIcon } from "lucide-react"
import { useTheme } from "../../../components/layout/ThemeContext.jsx" // Asegúrate que la ruta sea correcta

const ProductoDetailModal = ({ producto, onClose, onEdit }) => {
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

  // Formatear precio
  const formatPrice = (price) => {
    if (price === null || price === undefined) return "No disponible"
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
    { label: "Categoría", value: producto.Categorium?.nombre || "Sin categoría" },
    { label: "Precio", value: formatPrice(producto.precio) },
    { label: "Fecha de Creación", value: formatDate(producto.createdAt) },
    { label: "Estado", value: producto.estado, isStatus: true },
  ]

  // Componente para cada campo de detalle
  const DetailField = ({ label, value, isStatus }) => (
    <div>
      <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{label}</p>
      <p
        className={`font-medium capitalize flex items-center gap-2 ${
          isStatus
            ? producto.estado === "activo"
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
        {isStatus && (producto.estado === "activo" ? <CheckCircle size={16} /> : <AlertCircle size={16} />)}
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
              <Package size={18} />
            </span>
            Detalles del Producto
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Image Section */}
            <div className="md:col-span-1">
              <div
                className={`relative aspect-square rounded-lg overflow-hidden border ${
                  darkMode ? "bg-gray-900 border-gray-700" : "bg-slate-50 border-slate-200"
                }`}
              >
                {producto.imagenUrl ? (
                  <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className={`w-full h-full flex flex-col items-center justify-center text-center p-4 ${
                      darkMode ? "text-gray-500" : "text-slate-400"
                    }`}
                  >
                    <ImageIcon size={48} className="mb-2" />
                    <p className="text-sm">Sin imagen</p>
                  </div>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {productoDetails.map((detail) => (
                <DetailField key={detail.label} label={detail.label} value={detail.value} isStatus={detail.isStatus} />
              ))}
            </div>
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

export default ProductoDetailModal