import { useState, useEffect, useRef } from "react"
import { X, ShoppingBag, Plus, Minus, Trash2, Save } from "lucide-react"
import { createPedido, updatePedido, fetchClientesPedidos, fetchProductos } from "../api/pedidoservice.js"
import { toast } from "react-toastify"
import { useTheme } from "../../../components/layout/ThemeContext.jsx"
import FormField from "../../clientes/components/form/FormField.jsx"
import SelectField from "../../clientes/components/form/SelectField.jsx"

const PedidoForm = ({ pedido, onClose, onSave }) => {
  const { darkMode } = useTheme()
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
  const [clienteSearch, setClienteSearch] = useState("")
  const [showClienteDropdown, setShowClienteDropdown] = useState(false)
  const clienteInputRef = useRef(null)
  const clienteDropdownRef = useRef(null)

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
        id_cliente: pedido.id_cliente?.toString() || pedido.documentoIdentidad,
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
  }

  // Calcular el total del pedido
  const calcularTotal = () => {
    return formData.productos.reduce((total, item) => total + item.subtotal, 0)
  }

  // Validaciones de formulario
  const validations = {
    // id_cliente: (value) => (!value ? "El cliente es obligatorio" : ""),
    
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
      // Buscar si el cliente existe por id_cliente
      const clienteSeleccionado = clientes.find(
        (c) => c.id.toString() === formData.id_cliente
      )

      // Si no existe, buscar si el texto ingresado es un documento válido no encontrado
      let id_cliente = null
      let documentoIdentidad = null

      if (clienteSeleccionado) {
        id_cliente = Number.parseInt(formData.id_cliente)
      } else {
        // Intentar extraer el documento del input de búsqueda
        // Si el usuario seleccionó de la lista, clienteSearch tendrá "Nombre (Documento)"
        // Si no, puede haber escrito solo el documento
        // Extraer el documento si está entre paréntesis
        const match = clienteSearch.match(/\(([^)]+)\)$/)
        if (match) {
          documentoIdentidad = match[1]
        } else {
          // Si no hay paréntesis, usar el texto completo como documento
          documentoIdentidad = clienteSearch.trim()
        }
      }

      // Preparar datos para enviar
      const pedidoData = {
        id_cliente: id_cliente,
        documentoIdentidad: id_cliente ? undefined : documentoIdentidad,
        direccion_envio: formData.direccion_envio,
        total: calcularTotal(),
        productos: formData.productos.map((item) => {
          const productoData = {
            id_producto: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
          }
          if (pedido && item.id) {
            productoData.id = item.id
          }
          return productoData
        }),
      }

      // Elimina el campo documentoIdentidad si no aplica
      if (id_cliente) delete pedidoData.documentoIdentidad

      console.log("pedidoData: ", pedidoData)

      let respuesta
      if (pedido) {
        respuesta = await updatePedido(pedido.id, pedidoData)
        toast.success("Pedido actualizado exitosamente")
      } else {
        respuesta = await createPedido(pedidoData)
        toast.success("Pedido creado exitosamente")
      }

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

  // Cerrar dropdown si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        clienteDropdownRef.current &&
        !clienteDropdownRef.current.contains(event.target) &&
        clienteInputRef.current &&
        !clienteInputRef.current.contains(event.target)
      ) {
        setShowClienteDropdown(false)
      }
    }
    if (showClienteDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showClienteDropdown])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className={`rounded-xl shadow-xl w-full max-w-2xl p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    )
  }

  // Filtrar clientes por nombre o documento
  const filteredClientes = clientes.filter((cliente) => {
    const search = clienteSearch.toLowerCase()
    return (
      cliente.nombreCompleto?.toLowerCase().includes(search) ||
      cliente.documentoIdentidad?.toLowerCase().includes(search)
    )
  })

  // Manejar selección de cliente
  const handleClienteSelect = (cliente) => {
    setFormData((prev) => ({ ...prev, id_cliente: cliente.id.toString() }))
    setClienteSearch(cliente.nombreCompleto + (cliente.documentoIdentidad ? ` (${cliente.documentoIdentidad})` : ""))
    setShowClienteDropdown(false)
    if (errors.id_cliente) setErrors((prev) => ({ ...prev, id_cliente: "" }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`rounded-xl shadow-xl w-full max-w-3xl transform transition-all ${
        darkMode 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-slate-200'
      }`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${
          darkMode ? 'border-gray-700' : 'border-slate-200'
        }`}>
          <h2 className={`text-xl font-semibold flex items-center gap-3 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-lg shadow-lg">
              <ShoppingBag size={18} />
            </span>
            {pedido ? "Editar Pedido" : "Nuevo Pedido"}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-all ${
              darkMode 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {submitError && (
            <div className={`p-4 rounded-lg mb-6 border text-sm ${
              darkMode 
                ? 'bg-red-900/20 border-red-500/30 text-red-300' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {submitError}
            </div>
          )}

          {/* Cliente y Dirección */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="relative">
              <label className={`block mb-1.5 font-medium text-sm ${
                darkMode ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Cliente
              </label>
              <input
                ref={clienteInputRef}
                type="text"
                value={formData.id_cliente && !clienteSearch
                  ? (clientes.find(c => c.id.toString() === formData.id_cliente)?.nombreCompleto || pedido.documentoIdentidad)
                  : clienteSearch}
                onChange={e => {
                  setClienteSearch(e.target.value)
                  setShowClienteDropdown(true)
                  setFormData(prev => ({ ...prev, id_cliente: "" }))
                }}
                onFocus={() => setShowClienteDropdown(true)}
                placeholder="Buscar por nombre o documento..."
                className={`w-full rounded-lg p-2.5 text-sm transition-all duration-200 ${
                  darkMode
                    ? 'bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500/20'
                    : 'bg-white text-slate-900 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'
                } ${errors.id_cliente ? 'border-red-500' : ''}`}
              />
              {showClienteDropdown && filteredClientes.length > 0 && (
                <ul
                  ref={clienteDropdownRef}
                  className={`absolute z-30 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'} border rounded-lg mt-1 w-full max-h-56 overflow-auto shadow-lg`}
                >
                  {filteredClientes.slice(0, 20).map(cliente => (
                    <li
                      key={cliente.id}
                      className={`px-4 py-2 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'} transition-all duration-200`}
                      onClick={() => handleClienteSelect(cliente)}
                    >
                      <span className="font-medium">{cliente.nombreCompleto}</span>
                      {cliente.documentoIdentidad && (
                        <span className="ml-2 text-xs text-gray-400">({cliente.documentoIdentidad})</span>
                      )}
                    </li>
                  ))}
                  {filteredClientes.length > 20 && (
                    <li className="px-4 py-2 text-xs text-gray-400">Mostrando primeros 20 resultados...</li>
                  )}
                </ul>
              )}
              {errors.id_cliente && (
                <div className="text-red-400 text-xs mt-1">{errors.id_cliente}</div>
              )}
            </div>

            {cliente.nombreCompleto !== "DOMICILIO" && (
              <FormField
                type="text"
                name="direccion_envio"
                label="Dirección de Envío"
                value={formData.direccion_envio}
                error={errors.direccion_envio}
                onChange={handleChange}
              />
            )}


          {/* Sección Agregar Productos */}
          <div className={`p-4 rounded-lg border mb-6 ${
            darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-slate-50 border-slate-200'
          }`}>
            <h3 className={`font-medium mb-4 border-b pb-2 ${
              darkMode ? 'text-white border-gray-600' : 'text-slate-900 border-slate-200'
            }`}>
              Agregar Productos
            </h3>

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
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white 
                         px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 
                         transition-all duration-200 flex items-center gap-2 shadow-lg 
                         shadow-indigo-500/20 hover:shadow-indigo-500/30"
              >
                <Plus size={16} />
                Agregar Producto
              </button>
            </div>
          </div>

          {/* Lista de Productos */}
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
              <div className={`rounded-lg border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
                <table className="min-w-full">
                  <thead className={darkMode ? 'bg-gray-900' : 'bg-slate-50'}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-slate-500'} uppercase tracking-wider`}>
                        Producto
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-slate-500'} uppercase tracking-wider`}>
                        Cantidad
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-slate-500'} uppercase tracking-wider`}>
                        Precio Unit.
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-slate-500'} uppercase tracking-wider`}>
                        Subtotal
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-slate-500'} uppercase tracking-wider`}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-slate-200'}`}>
                    {formData.productos.map((item, index) => (
                      <tr key={index} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50'} transition-colors duration-200`}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                          {item.producto?.nombre || "Producto no disponible"}
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => actualizarCantidad(index, item.cantidad - 1)}
                              className={`p-1 rounded-l transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              value={item.cantidad}
                              onChange={(e) => actualizarCantidad(index, Number.parseInt(e.target.value) || 1)}
                              className={`w-12 text-center border-0 py-1 ${darkMode ? 'bg-gray-700 text-white' : 'bg-slate-100 text-slate-900'}`}
                              min="1"
                            />
                            <button
                              type="button"
                              onClick={() => actualizarCantidad(index, item.cantidad + 1)}
                              className={`p-1 rounded-r transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
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
                      <td className="px-4 py-3 text-right font-bold text-indigo-500">
                        ${formatearPesosColombianos(calcularTotal())}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white transition-all duration-200 ${
                isSubmitting
                  ? darkMode
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/20 hover:shadow-green-500/30"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {pedido ? "Actualizar" : "Guardar"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PedidoForm
