"use client"

import { Edit, ShoppingBag, Clock, RefreshCw, X, Package, User } from "lucide-react"
import { useTheme } from "../../../components/layout/ThemeContext.jsx"

const PedidoDetailModal = ({ pedido, onClose, onEdit, onChangeStatus }) => {
  const { darkMode } = useTheme()
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatearPesosColombianos = (valor) => {
    return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const estadoColors = {
    pendiente: "text-yellow-400",
    preparacion: "text-blue-400",
    terminado: "text-green-400",
    cancelado: "text-red-400",
  }

  const estadoIcons = {
    pendiente: <Clock className="h-5 w-5 text-yellow-400" />,
    preparacion: <RefreshCw className="h-5 w-5 text-blue-400" />,
    terminado: <Clock className="h-5 w-5 text-green-400" />,
    cancelado: <Clock className="h-5 w-5 text-red-400" />,
  }

  const productosEnPedido = (pedido.Productos || []).map(producto => {
    const cantidad = producto.PedidoProducto?.cantidad;
    const precio_unitario = producto.PedidoProducto?.precio_unitario ?? producto.precio ?? 0;
    const subtotal = cantidad * precio_unitario;

    return {
      cantidad,
      precio_unitario,
      subtotal,
      Producto: producto
    };
  });

  const calcularTotal = () => {
    return productosEnPedido.reduce((total, item) => total + item.subtotal, 0);
  }

  const estadosDisponibles = [
    { value: "pendiente", label: "Pendiente" },
    { value: "preparacion", label: "En preparación" },
    { value: "terminado", label: "Terminado" },
    { value: "cancelado", label: "Cancelado" }
  ];

  const getEstadosSiguientes = () => {
    switch (pedido.estado) {
      case "pendiente":
        return estadosDisponibles.filter(e => e.value === "preparacion" || e.value === "cancelado");
      case "preparacion":
        return estadosDisponibles.filter(e => e.value === "terminado" || e.value === "cancelado");
      case "terminado":
      case "cancelado":
        return [];
      default:
        return estadosDisponibles;
    }
  };

  const handleCambiarEstado = () => {
    if (typeof onChangeStatus === 'function') {
      const estadosSiguientes = getEstadosSiguientes();
      if (estadosSiguientes.length === 1) {
        onChangeStatus(pedido.id, estadosSiguientes[0].value);
      } else if (estadosSiguientes.length > 1) {
        onChangeStatus(pedido.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/30 via-black/40 to-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-auto ${
        darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border-slate-200"
      }`}>
        <div className={`flex justify-between items-center p-6 border-b sticky top-0 z-10 ${
          darkMode ? "border-gray-700 bg-gray-800" : "border-slate-200 bg-white"
        }`}>
          <h2 className={`text-xl font-semibold flex items-center gap-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-lg shadow-lg">
              <ShoppingBag size={18} />
            </span>
            Pedido #{pedido.id}
          </h2>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${estadoColors[pedido.estado].replace("text-", "bg-").replace("-400", "-900")} bg-opacity-30`}>
              {estadoIcons[pedido.estado]}
              <span className={`text-sm font-medium ${estadoColors[pedido.estado]}`}>
                {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800 p-1 rounded-full transition-colors"
              title="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Información del cliente */}
          <div className={`rounded-lg p-4 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"}`}>
            <h4 className={`font-medium mb-3 flex items-center gap-2 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-1.5 rounded-lg shadow-lg">
                <User size={14} />
              </span>
              Información del Cliente
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Cliente</p>
                <p className="text-white font-medium">{pedido.Cliente?.nombrecompleto}</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-gray-400 text-sm">Dirección de Envío</p>
                <p 
                  className={`font-medium truncate hover:text-clip hover:whitespace-normal cursor-help ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                  title={pedido.direccion_envio}
                >{pedido.direccion_envio}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Fecha del Pedido</p>
                <p className="text-white font-medium">{formatDate(pedido.fecha_pedido)}</p>
              </div>
            </div>
          </div>

          {/* Lista de productos */}
          <div>
            <h4 className="text-indigo-400 font-medium mb-3 flex items-center">
              <Package className="mr-2" size={16} />
              Productos ({productosEnPedido.length})
            </h4>

            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="min-w-full">
                <thead className={darkMode ? "bg-gray-900" : "bg-slate-50"}>
                  <tr>
                    <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                      darkMode ? "text-indigo-400" : "text-indigo-600"
                    }`}>Producto</th>
                    <th className={`px-4 py-2 text-center text-xs font-medium uppercase tracking-wider ${
                      darkMode ? "text-indigo-400" : "text-indigo-600"
                    }`}>Cantidad</th>
                    <th className={`px-4 py-2 text-right text-xs font-medium uppercase tracking-wider ${
                      darkMode ? "text-indigo-400" : "text-indigo-600"
                    }`}>Precio Unit.</th>
                    <th className={`px-4 py-2 text-right text-xs font-medium uppercase tracking-wider ${
                      darkMode ? "text-indigo-400" : "text-indigo-600"
                    }`}>Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {productosEnPedido.length > 0 ? (
                    productosEnPedido.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                          <div className="flex items-center">
                            <div className="h-8 w-8 flex-shrink-0 rounded bg-gray-700 mr-3 flex items-center justify-center">
                              {item.Producto?.imagen ? (
                                <img 
                                  src={item.Producto.imagen} 
                                  alt={item.Producto.nombre} 
                                  className="h-8 w-8 rounded object-cover"
                                />
                              ) : (
                                <Package size={14} className="text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{item.Producto?.nombre || "Producto"}</div>
                              <div className="text-xs text-gray-400">{item.Producto?.categoria || ""}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-300">{item.cantidad}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-300">${formatearPesosColombianos(item.precio_unitario)}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-white">${formatearPesosColombianos(item.subtotal)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-4 text-center text-gray-400">No hay productos en este pedido</td>
                    </tr>
                  )}
                  <tr className={darkMode ? "bg-gray-900" : "bg-slate-50"}>
                    <td colSpan="3" className={`px-4 py-3 text-right font-medium ${
                      darkMode ? "text-white" : "text-slate-900"
                    }`}>Total del Pedido:</td>
                    <td className={`px-4 py-3 text-right font-bold ${
                      darkMode ? "text-indigo-400" : "text-indigo-600"
                    }`}>${formatearPesosColombianos(pedido.total || calcularTotal())}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Botones finales */}
          <div className={`flex justify-end gap-3 pt-4 border-t ${darkMode ? "border-gray-700" : "border-slate-200"}`}>
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

export default PedidoDetailModal
