"use client"

import { useState, useEffect } from "react"
import { X, Save, Package, DollarSign, Barcode, Calendar } from "lucide-react"
import { createInventario, updateInventario } from "../api/InventoryService.js"
import FormFieldInvent from "./form/FormFieldInvent"
import { toast } from "react-toastify"

const InventoryForm = ({ item, onClose, onSave }) => {
  const initialFormData = {
    nombre_producto: "",
    cantidad: "",
    precio_compra: "",
    precio_venta: "",
    codigo: "",
    fecha_ultima_modificacion: new Date().toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2
  const [formSubmitted, setFormSubmitted] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        nombre_producto: item.nombre_producto || "",
        cantidad: item.cantidad || "",
        precio_compra: item.precio_compra || "",
        precio_venta: item.precio_venta || "",
        codigo: item.codigo || "",
        fecha_ultima_modificacion: item.fecha_ultima_modificacion ? 
          new Date(item.fecha_ultima_modificacion).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0]
      })
    }
  }, [item])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Validaciones específicas por tipo de campo
    if (name === "cantidad" && !/^\d*$/.test(value)) return
    if ((name === "precio_compra" || name === "precio_venta") && !/^\d*\.?\d*$/.test(value)) return

    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const validations = {
    nombre_producto: (value) => {
      if (!value.trim()) return "El nombre del producto es obligatorio"
      if (value.length < 3) return "El nombre debe tener al menos 3 caracteres"
      return ""
    },
    cantidad: (value) => {
      if (!value) return "La cantidad es obligatoria"
      if (value < 0) return "La cantidad no puede ser negativa"
      if (!/^\d+$/.test(value)) return "La cantidad debe ser un número entero"
      return ""
    },
    precio_compra: (value) => {
      if (!value) return "El precio de compra es obligatorio"
      if (value <= 0) return "El precio de compra debe ser mayor a 0"
      return ""
    },
    precio_venta: (value) => {
      if (!value) return "El precio de venta es obligatorio"
      if (value <= 0) return "El precio de venta debe ser mayor a 0"
      if (parseFloat(value) <= parseFloat(formData.precio_compra)) 
        return "El precio de venta debe ser mayor al precio de compra"
      return ""
    },
    codigo: (value) => {
      if (!value.trim()) return "El código es obligatorio"
      if (value.length < 3) return "El código debe tener al menos 3 caracteres"
      return ""
    }
  }

  const validateCurrentStep = () => {
    const newErrors = {}
    const fieldsToValidate = currentStep === 1 
      ? ["nombre_producto", "cantidad", "codigo"] 
      : ["precio_compra", "precio_venta"]

    fieldsToValidate.forEach(field => {
      if (validations[field]) {
        const error = validations[field](formData[field])
        if (error) newErrors[field] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateForm = () => {
    const newErrors = {}
    Object.keys(validations).forEach(field => {
      const error = validations[field](formData[field])
      if (error) newErrors[field] = error
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submitForm = async () => {
    if (formSubmitted) return
    setFormSubmitted(true)

    if (!validateForm()) {
      setFormSubmitted(false)
      toast.error("Por favor, corrige los errores en el formulario")
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      let savedItem
      if (item) {
        savedItem = await updateInventario(item.id, formData)
        toast.success("Item de inventario actualizado exitosamente")
      } else {
        savedItem = await createInventario(formData)
        toast.success("Item de inventario creado exitosamente")
      }

      if (typeof onSave === 'function') {
        onSave(savedItem)
      }
      onClose()
    } catch (error) {
      console.error("Error al guardar item:", error)
      const errorMsg = error.message || "Error al guardar el item de inventario"
      toast.error(errorMsg)
      setSubmitError(errorMsg)
      setFormSubmitted(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    } else {
      toast.warning("Por favor, completa correctamente todos los campos")
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const formFieldsByStep = {
    1: [
      {
        type: "text",
        name: "nombre_producto",
        label: "Nombre del Producto",
        value: formData.nombre_producto,
        error: errors.nombre_producto,
        icon: <Package size={18} className="text-orange-400" />
      },
      {
        type: "text",
        name: "codigo",
        label: "Código",
        value: formData.codigo,
        error: errors.codigo,
        icon: <Barcode size={18} className="text-orange-400" />
      },
      {
        type: "number",
        name: "cantidad",
        label: "Cantidad",
        value: formData.cantidad,
        error: errors.cantidad,
        icon: <Package size={18} className="text-orange-400" />,
        min: "0"
      }
    ],
    2: [
      {
        type: "number",
        name: "precio_compra",
        label: "Precio de Compra",
        value: formData.precio_compra,
        error: errors.precio_compra,
        icon: <DollarSign size={18} className="text-orange-400" />,
        step: "0.01",
        min: "0"
      },
      {
        type: "number",
        name: "precio_venta",
        label: "Precio de Venta",
        value: formData.precio_venta,
        error: errors.precio_venta,
        icon: <DollarSign size={18} className="text-orange-400" />,
        step: "0.01",
        min: "0"
      }
    ]
  }

  const FormSteps = () => (
    <div className="flex justify-center mb-6">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm
              ${currentStep === step 
                ? "bg-orange-500 shadow-lg shadow-orange-500/30"
                : currentStep > step 
                  ? "bg-green-500 shadow-lg shadow-green-500/30"
                  : "bg-gray-700"
              }`}
          >
            {step}
          </div>
          {step < totalSteps && (
            <div className={`w-12 h-1 ${currentStep > step ? "bg-green-500" : "bg-gray-700"}`} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-orange-500 animate-fade-in">
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-950">
          <h2 className="text-lg font-bold text-white flex items-center">
            <span className="bg-orange-500 text-white p-1.5 rounded-lg mr-2">
              <Package size={16} />
            </span>
            {item ? "Editar Item" : "Nuevo Item"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:rotate-90 transition-all bg-gray-800 p-1.5 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {submitError && (
            <div className="bg-red-900 text-white p-3 rounded-lg mb-4 animate-pulse border border-red-500 text-sm">
              {submitError}
            </div>
          )}

          <FormSteps />

          <div>
            {formFieldsByStep[currentStep].map((field) => (
  <FormFieldInvent key={field.name} {...field} onChange={handleChange} />
))}

            <div className="flex justify-between mt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Atrás
                </button>
              ) : (
                <div />
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitForm}
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
                    isSubmitting ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  <Save size={18} />
                  {item ? "Actualizar" : "Guardar"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InventoryForm