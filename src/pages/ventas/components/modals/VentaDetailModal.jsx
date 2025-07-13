"use client"

import { X, Receipt, CreditCard, Banknote, CheckCircle, Calendar, ShoppingBag, User, MapPin, Edit } from "lucide-react"

const VentaDetailModal = ({ venta, onClose, onEdit }) => {
  // Función para formatear valores en pesos colombianos
  const formatearPesosColombianos = (valor) => {
    if (!valor) return "0"
    return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl border-r-2 border-orange-500 animate-fade-in max-h-screen overflow-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Receipt className="mr-2 text-orange-500" size={24} />
            Detalles de la Venta #{venta.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:rotate-90 transition-all bg-gray-800 p-2 rounded-full"
            title="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Información principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-medium mb-3 border-b border-gray-700 pb-2 flex items-center">
                <Receipt className="mr-2 text-orange-400" size={18} />
                Información de la Venta
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">ID de Venta:</p>
                  <p className="text-white font-medium">#{venta.id}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Fecha de Venta:</p>
                  <p className="text-white flex items-center">
                    <Calendar className="mr-1 text-gray-500" size={14} />
                    {formatearFecha(venta.fecha_venta)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Total Pagado:</p>
                  <p className="text-xl font-bold text-orange-400">${formatearPesosColombianos(venta.total_pagar)}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Método de Pago:</p>
                  <div className="flex items-center mt-1">
                    {venta.metodo_pago === "efectivo" ? (
                      <span className="flex items-center bg-green-900 bg-opacity-30 text-green-300 px-3 py-1 rounded-full border border-green-600">
                        <Banknote size={14} className="mr-1" />
                        Efectivo
                      </span>
                    ) : (
                      <span className="flex items-center bg-blue-900 bg-opacity-30 text-blue-300 px-3 py-1 rounded-full border border-blue-600">
                        <CreditCard size={14} className="mr-1" />
                        Transferencia
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-medium mb-3 border-b border-gray-700 pb-2 flex items-center">
                <ShoppingBag className="mr-2 text-orange-400" size={18} />
                Información del Pedido
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">ID de Pedido:</p>
                  <p className="text-white font-medium">#{venta.id_pedido}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Estado del Pedido:</p>
                  <div className="flex items-center mt-1">
                    <span className="flex items-center bg-green-900 bg-opacity-30 text-green-300 px-3 py-1 rounded-full border border-green-600">
                      <CheckCircle size={14} className="mr-1" />
                      Terminado
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Cliente:</p>
                  <p className="text-white flex items-center">
                    <User className="mr-1 text-gray-500" size={14} />
                    {venta.Pedido?.Cliente?.nombrecompleto || "No disponible"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Dirección de Envío:</p>
                  <p className="text-white flex items-center">
                    <MapPin className="mr-1 text-gray-500" size={14} />
                    {venta.Pedido?.direccion_envio || "No disponible"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Productos del pedido */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
            <h3 className="text-white font-medium mb-3 border-b border-gray-700 pb-2">Productos Vendidos</h3>

            {venta.Pedido?.Productos && venta.Pedido.Productos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-orange-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-orange-500 uppercase tracking-wider">
                        Precio Unit.
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-orange-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {venta.Pedido.Productos.map((producto, index) => (
                      <tr key={index} className="hover:bg-gray-700">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-white">
                          {producto.nombre || "Producto no disponible"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-300">
                          {producto.PedidoProducto?.cantidad || 1}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-300">
                          ${formatearPesosColombianos(producto.PedidoProducto?.precio_unitario || producto.precio)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-white">
                          $
                          {formatearPesosColombianos(
                            (producto.PedidoProducto?.cantidad || 1) *
                              (producto.PedidoProducto?.precio_unitario || producto.precio),
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-900">
                      <td colSpan="3" className="px-4 py-2 text-right font-medium text-white">
                        Total:
                      </td>
                      <td className="px-4 py-2 text-right font-bold text-orange-400">
                        ${formatearPesosColombianos(venta.total_pagar)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No hay información de productos disponible</p>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
            >
              Cerrar
            </button>
            <button
              onClick={() => onEdit(venta)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 border border-orange-500"
            >
              <Edit size={18} />
              Editar Venta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VentaDetailModal
