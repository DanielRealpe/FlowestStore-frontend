"use client"

import { useState, useEffect } from "react"
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react"
import { createPedido, updatePedido, fetchClientesPedidos, fetchProductos } from "../api/pedidoservice.js"
import { toast } from "react-toastify"

import FormField from "../../clientes/components/form/FormField.jsx"
import SelectField from "../../clientes/components/form/SelectField.jsx"

const PedidoForm = ({ pedido, onClose, onSave }) => {
  const initialFormData = {
    id_cliente: "",
    direccion_envio: "",
    productos: [], // Array para almacenar múltiples productos
  }

  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentProducto, setCurrentProducto] = useState("")
  const [currentCantidad, setCurrentCantidad] = useState(1)

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [clientesData, productosData] = await Promise.all([fetchClientesPedidos(), fetchProductos()])
        setClientes(clientesData)
        setProductos(productosData)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast.error("Error al cargar los datos iniciales. Por favor, recarga la página.")

        // Añadir más información de diagnóstico
        if (error.response) {
          console.error("Error de respuesta:", {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          })
        } else if (error.request) {
          console.error("Error de solicitud sin respuesta:", error.request)
        } else {
          console.error("Error de configuración:", error.message)
        }

        setSubmitError("Error al cargar datos: " + (error.message || "Error desconocido"))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (pedido && productos.length > 0) {
      // Acceder directamente a PedidoProductos sin sub-objeto
      const pedidoProductos =
        pedido.Productos?.map((producto) => {
          return {
            producto_id: producto.id,
            cantidad: producto.PedidoProducto?.cantidad || 1,
            precio_unitario: producto.PedidoProducto?.precio_unitario || producto.precio,
            subtotal:
              (producto.PedidoProducto?.cantidad || 1) * (producto.PedidoProducto?.precio_unitario || producto.precio),
            producto: producto,
            id: producto.PedidoProducto?.id, // Añadir el ID de la relación
          }
        }) || []

      setFormData({
        id_cliente: pedido.id_cliente?.toString(),
        direccion_envio: pedido.direccion_envio || "",
        productos: pedidoProductos,
      })
    }
  }, [pedido, productos])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error del campo cuando cambia
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleProductoChange = (e) => {
    setCurrentProducto(e.target.value)
  }

  const handleCantidadChange = (valor) => {
    setCurrentCantidad(Math.max(1, valor))
  }

  // Agregar producto al pedido
  const agregarProducto = () => {
    if (!currentProducto) {
      setErrors((prev) => ({ ...prev, producto: "Seleccione un producto" }))
      toast.warning("Por favor selecciona un producto")
      return
    }

    const productoSeleccionado = productos.find((p) => p.id.toString() === currentProducto)
    if (!productoSeleccionado) return

    // Verificar si el producto ya está en la lista
    const productoExistente = formData.productos.find((p) => p.producto_id.toString() === currentProducto)

    if (productoExistente) {
      // Actualizar cantidad si ya existe
      const nuevosProductos = formData.productos.map((p) =>
        p.producto_id.toString() === currentProducto
          ? {
              ...p,
              cantidad: p.cantidad + currentCantidad,
              subtotal: (p.cantidad + currentCantidad) * p.precio_unitario,
            }
          : p,
      )

      setFormData((prev) => ({
        ...prev,
        productos: nuevosProductos,
      }))

      toast.info(`Cantidad de ${productoSeleccionado.nombre} actualizada`)
    } else {
      // Agregar nuevo producto
      const nuevoProducto = {
        producto_id: Number.parseInt(currentProducto),
        cantidad: currentCantidad,
        precio_unitario: productoSeleccionado.precio,
        subtotal: productoSeleccionado.precio * currentCantidad,
        producto: productoSeleccionado, // Incluir información del producto para mostrar
      }

      setFormData((prev) => ({
        ...prev,
        productos: [...prev.productos, nuevoProducto],
      }))

      
    }

    // Resetear selección
    setCurrentProducto("")
    setCurrentCantidad(1)

    // Limpiar error si existe
    if (errors.producto) {
      setErrors((prev) => ({ ...prev, producto: "" }))
    }
  }

  // Eliminar producto del pedido
  const eliminarProducto = (index) => {
    const productoEliminado = formData.productos[index]
    const nuevosProductos = [...formData.productos]
    nuevosProductos.splice(index, 1)
    setFormData((prev) => ({ ...prev, productos: nuevosProductos }))

    toast.info(`${productoEliminado.producto?.nombre || "Producto"} eliminado del pedido`)
  }

  // Actualizar cantidad de un producto ya agregado
  const actualizarCantidad = (index, nuevaCantidad) => {
    if (nuevaCantidad < 1) return

    const nuevosProductos = [...formData.productos]
    const producto = nuevosProductos[index]
    nuevosProductos[index].cantidad = nuevaCantidad
    nuevosProductos[index].subtotal = nuevaCantidad * nuevosProductos[index].precio_unitario

    setFormData((prev) => ({ ...prev, productos: nuevosProductos }))

    toast.info(`Cantidad de ${producto.producto?.nombre} actualizada a ${nuevaCantidad}`)
  }

  // Calcular el total del pedido
  const calcularTotal = () => {
    return formData.productos.reduce((total, item) => total + item.subtotal, 0)
  }

  // Validaciones de formulario
  const validations = {
    id_cliente: (value) => (!value ? "El cliente es obligatorio" : ""),
    
    productos: (array) => (array.length === 0 ? "Debe agregar al menos un producto" : ""),
  }

  const validateForm = () => {
    const newErrors = {}

    // Validar cada campo
    Object.keys(validations).forEach((field) => {
      const error = validations[field](formData[field])
      if (error) newErrors[field] = error
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Preparar datos para enviar
      const pedidoData = {
        id_cliente: Number.parseInt(formData.id_cliente),
        direccion_envio: formData.direccion_envio,
        total: calcularTotal(),
        productos: formData.productos.map((item) => {
          const productoData = {
            id_producto: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
          }

          // Si estamos editando un pedido y el producto tiene un id de relación, incluirlo
          if (pedido && item.id) {
            productoData.id = item.id
          }
          return productoData
        }),
      }
      console.log("pedidoData: ", pedidoData)

      let respuesta
      if (pedido) {
        respuesta = await updatePedido(pedido.id, pedidoData)
        toast.success("Pedido actualizado exitosamente")
      } else {
        respuesta = await createPedido(pedidoData)
        toast.success("Pedido creado exitosamente")
      }

      // Pasar la respuesta al componente padre para que actualice la lista correctamente
      onSave(respuesta)
    } catch (error) {
    
      const errorMessage = error.message || "Error al guardar el pedido"
      setSubmitError(errorMessage)
      toast.error(`Error: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Formato de moneda en pesos colombianos
  const formatearPesosColombianos = (valor) => {
    return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl p-6 border-r-2 border-orange-500 animate-fade-in">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl border-r-2 border-orange-500 animate-fade-in max-h-screen overflow-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-xl font-bold text-white flex items-center">
            <ShoppingBag className="mr-2 text-orange-500" size={24} />
            {pedido ? "Editar Pedido" : "Nuevo Pedido"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:rotate-90 transition-all bg-gray-800 p-2 rounded-full"
            title="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {submitError && (
            <div className="bg-red-900 text-white p-4 rounded-lg mb-6 animate-pulse border border-red-500">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Cliente */}
            <SelectField
              name="id_cliente"
              label="Cliente"
              value={formData.id_cliente}
              options={[
                { value: "", label: "Seleccionar cliente" },
                ...clientes.map((cliente) => ({
                  value: cliente.id.toString(),
                  label: cliente.nombreCompleto,
                })),
              ]}
              onChange={handleChange}
              error={errors.id_cliente}
              className={errors.id_cliente ? "border-red-500" : ""}
            />

            {/* Dirección de envío */}
            <FormField
              type="text"
              name="direccion_envio"
              label="Dirección de Envío"
              value={formData.direccion_envio}
              error={errors.direccion_envio}
              onChange={handleChange}
            />
          </div>

          {/* Sección para agregar productos */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
            <h3 className="text-white font-medium mb-4 border-b border-gray-700 pb-2">Agregar Productos</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <SelectField
                  name="producto"
                  label="Producto"
                  value={currentProducto}
                  options={[
                    { value: "", label: "Seleccionar producto" },
                    ...productos
                      .filter((p) => !formData.productos.some((fp) => fp.producto_id === p.id && fp.cantidad >= 10))
                      .map((producto) => ({
                        value: producto.id.toString(),
                        label: `${producto.nombre} - $${producto.precio.toLocaleString("es-CO")}`,
                      })),
                  ]}
                  onChange={handleProductoChange}
                  error={errors.producto}
                  className={errors.producto ? "border-red-500" : ""}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Cantidad</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleCantidadChange(currentCantidad - 1)}
                    className="bg-gray-700 text-white p-2 rounded-l-lg hover:bg-gray-600 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={currentCantidad}
                    onChange={(e) => handleCantidadChange(Number.parseInt(e.target.value) || 1)}
                    className="w-full text-center bg-gray-700 text-white border-0 py-2"
                    min="1"
                  />
                  <button
                    type="button"
                    onClick={() => handleCantidadChange(currentCantidad + 1)}
                    className="bg-gray-700 text-white p-2 rounded-r-lg hover:bg-gray-600 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={agregarProducto}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Agregar Producto
              </button>
            </div>
          </div>

          {/* Lista de productos agregados */}
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3">Productos en este pedido</h3>

            {errors.productos && (
              <div className="bg-red-900 bg-opacity-30 text-red-300 p-2 rounded mb-3 text-sm border border-red-800">
                {errors.productos}
              </div>
            )}

            {formData.productos.length === 0 ? (
              <div className="text-center py-6 text-gray-400 bg-gray-800 rounded-lg border border-gray-700">
                No hay productos agregados al pedido
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-orange-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-orange-500 uppercase tracking-wider">
                        Precio Unit.
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-orange-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-orange-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {formData.productos.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                          {item.producto?.nombre || "Producto no disponible"}
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => actualizarCantidad(index, item.cantidad - 1)}
                              className="bg-gray-700 text-white p-1 rounded-l hover:bg-gray-600 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              value={item.cantidad}
                              onChange={(e) => actualizarCantidad(index, Number.parseInt(e.target.value) || 1)}
                              className="w-12 text-center bg-gray-700 text-white border-0 py-1"
                              min="1"
                            />
                            <button
                              type="button"
                              onClick={() => actualizarCantidad(index, item.cantidad + 1)}
                              className="bg-gray-700 text-white p-1 rounded-r hover:bg-gray-600 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-300">
                          ${formatearPesosColombianos(item.precio_unitario)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-white">
                          ${formatearPesosColombianos(item.subtotal)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => eliminarProducto(index)}
                            className="text-red-500 hover:text-red-400 transition-colors p-1"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-900">
                      <td colSpan="3" className="px-4 py-3 text-right font-medium text-white">
                        Total del Pedido:
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-orange-400">
                        ${formatearPesosColombianos(calcularTotal())}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 border border-orange-500 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Guardando...
                </>
              ) : (
                "Guardar Pedido"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PedidoForm
