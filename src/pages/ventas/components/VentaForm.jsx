"use client"

import { useState, useEffect } from "react"
import { X, Receipt, CreditCard, Banknote, CheckCircle, AlertCircle, User } from "lucide-react"
import { toast } from "react-toastify"
import { createVenta, updateVenta, fetchPedidosTerminados } from "../api/ventaservice.js"
import SelectField from "../../clientes/components/form/SelectField.jsx"

const VentaForm = ({ venta, onClose, onSave }) => {
  const initialFormData = {
    id_pedido: "",
    metodo_pago: "efectivo",
  }

  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const pedidosData = await fetchPedidosTerminados()
        setPedidos(pedidosData || [])
      } catch (error) {
        console.error("Error al cargar pedidos:", error)
        setSubmitError("Error al cargar pedidos: " + (error.message || "Error desconocido"))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (venta) {
      setFormData({
        id_pedido: venta.id_pedido?.toString() || "",
        metodo_pago: venta.metodo_pago || "efectivo",
      })
    }
  }, [venta])

  useEffect(() => {
    if (formData.id_pedido) {
      const pedido = pedidos.find((p) => p.id?.toString() === formData.id_pedido)
      setPedidoSeleccionado(pedido || null)
    } else {
      setPedidoSeleccionado(null)
    }
  }, [formData.id_pedido, pedidos])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error del campo cuando cambia
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Formato de moneda en pesos colombianos
  const formatearPesosColombianos = (valor) => {
    if (!valor) return "0"
    return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  // Validaciones de formulario
  const validations = {
    id_pedido: (value) => (!value ? "El pedido es obligatorio" : ""),
    metodo_pago: (value) => (!value ? "El método de pago es obligatorio" : ""),
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
      const ventaData = {
        id_pedido: Number.parseInt(formData.id_pedido, 10),
        metodo_pago: formData.metodo_pago,
      }

      let respuesta
      if (venta) {
        respuesta = await updateVenta(venta.id, ventaData)
        // SOLO mostrar toast para edición exitosa
        toast.success(`¡Venta #${venta.id} actualizada exitosamente!`, {
          position: "top-right",
          autoClose: 4000,
        })
      } else {
        respuesta = await createVenta(ventaData)
        // No mostrar toast para creación, solo para edición
      }

      console.log("Respuesta de guardar venta:", respuesta)

      // Pasar la respuesta al componente padre para que actualice la lista correctamente
      onSave(respuesta)
    } catch (error) {
      console.error("Error al guardar venta:", error)
      const errorMessage = error.message || "Venta ya registrada"
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl p-6 border-2 border-orange-500 animate-fade-in">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#121831] rounded-xl shadow-2xl w-full max-w-2xl border-2 border-orange-500 animate-fade-in max-h-screen overflow-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-800 sticky top-0 bg-[#121831] z-10">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Receipt className="mr-2 text-orange-500" size={24} />
            {venta ? "Editar Venta" : "Nueva Venta"}
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

          <div className="mb-6">
            <SelectField
              name="id_pedido"
              label="Pedido Terminado"
              value={formData.id_pedido}
              options={[
                { value: "", label: "Seleccionar pedido" },
                ...pedidos.map((pedido) => ({
                  value: pedido.id.toString(),
                  label: `Pedido #${pedido.id} - ${pedido.Cliente?.nombrecompleto || "Cliente"} - $${formatearPesosColombianos(pedido.total)}`,
                })),
              ]}
              onChange={handleChange}
              error={errors.id_pedido}
              className={errors.id_pedido ? "border-red-500" : ""}
              disabled={!!venta} // Deshabilitar si estamos editando
            />
          </div>

          {pedidoSeleccionado && (
            <div className="mb-6 bg-gray-800 p-4 rounded-lg border-l-4 border-orange-500">
              <h3 className="text-white font-medium mb-3 border-b border-gray-700 pb-2">Detalles del Pedido</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Cliente:</p>
                  <p className="text-white flex items-center">
                    <User size={16} className="mr-2 text-orange-400" />
                    {pedidoSeleccionado.Cliente?.nombrecompleto || "No disponible"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Dirección:</p>
                  <p className="text-white">{pedidoSeleccionado.direccion_envio || "No disponible"}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Fecha del Pedido:</p>
                  <p className="text-white">
                    {new Date(pedidoSeleccionado.fecha_pedido).toLocaleString("es-CO", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Total a Pagar:</p>
                  <p className="text-xl font-bold text-orange-400">
                    ${formatearPesosColombianos(pedidoSeleccionado.total)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center">
                <div className="flex items-center bg-green-900 bg-opacity-30 text-green-300 px-3 py-1 rounded-full border border-green-600">
                  <CheckCircle size={16} className="mr-1" />
                  <span className="text-sm">Pedido Terminado</span>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">Método de Pago</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                  formData.metodo_pago === "efectivo"
                    ? "bg-green-900 bg-opacity-20 border-green-500"
                    : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name="metodo_pago"
                  value="efectivo"
                  checked={formData.metodo_pago === "efectivo"}
                  onChange={handleChange}
                  className="sr-only"
                />
                <Banknote
                  className={`mr-3 ${formData.metodo_pago === "efectivo" ? "text-green-500" : "text-gray-400"}`}
                  size={24}
                />
                <div>
                  <p className={`font-medium ${formData.metodo_pago === "efectivo" ? "text-green-300" : "text-white"}`}>
                    Efectivo
                  </p>
                  <p className="text-sm text-gray-400">Pago en efectivo al momento de la entrega</p>
                </div>
              </label>

              <label
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                  formData.metodo_pago === "transferencia"
                    ? "bg-blue-900 bg-opacity-20 border-blue-500"
                    : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name="metodo_pago"
                  value="transferencia"
                  checked={formData.metodo_pago === "transferencia"}
                  onChange={handleChange}
                  className="sr-only"
                />
                <CreditCard
                  className={`mr-3 ${formData.metodo_pago === "transferencia" ? "text-blue-500" : "text-gray-400"}`}
                  size={24}
                />
                <div>
                  <p
                    className={`font-medium ${formData.metodo_pago === "transferencia" ? "text-blue-300" : "text-white"}`}
                  >
                    Transferencia
                  </p>
                  <p className="text-sm text-gray-400">Pago mediante transferencia bancaria</p>
                </div>
              </label>
            </div>
            {errors.metodo_pago && <p className="text-red-500 text-sm mt-1">{errors.metodo_pago}</p>}
          </div>

          {!pedidoSeleccionado && formData.id_pedido && (
            <div className="mb-6 bg-yellow-900 bg-opacity-20 p-4 rounded-lg border border-yellow-700 flex items-start">
              <AlertCircle className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" size={20} />
              <p className="text-yellow-300 text-sm">Pedido no encontrado. Por favor, selecciona un pedido válido.</p>
            </div>
          )}

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
              disabled={isSubmitting || !pedidoSeleccionado}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <Receipt size={18} />
                  {venta ? "Actualizar Venta" : "Registrar Venta"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VentaForm
