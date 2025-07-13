"use client"

import { useState, useEffect } from "react"
import { X, Save, Package, ImageIcon, DollarSign, TagIcon, AlignLeft, CheckCircle, AlertCircle } from "lucide-react"
import { createProducto, updateProducto } from "../api/ProductoService"
import { fetchCategorias } from "../../categorias/api/categoriaService"

const ProductoForm = ({ producto, onClose, onSave }) => {
  const initialFormData = {
    nombre: "",
    descripcion: "",
    precio: "",
    Id_Categoria: "",
    imagenUrl: "",
    estado: "activo", // Por defecto siempre activo
  }

  // Estados para el formulario
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [imagePreview, setImagePreview] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Estados para las categorías
  const [categorias, setCategorias] = useState([])
  const [loadingCategorias, setLoadingCategorias] = useState(false)

  // Cargar categorías
  const loadCategorias = async () => {
    try {
      setLoadingCategorias(true)
      const data = await fetchCategorias()
      console.log("Categorías cargadas:", data)
      console.log("Estructura de categorías:", data.data || [])
      setCategorias(data.data || [])
    } catch (error) {
      console.error("Error al cargar categorías:", error)
    } finally {
      setLoadingCategorias(false)
    }
  }

  useEffect(() => {
    // Cargar categorías al montar el componente
    loadCategorias()

    // Inicializar formulario con datos del producto si existe
    if (producto) {
      console.log("Inicializando formulario con producto:", producto)
      setFormData({
        nombre: producto.nombre || "",
        descripcion: producto.descripcion || "",
        precio: producto.precio?.toString() || "",
        Id_Categoria: producto.Id_Categoria || "",
        imagenUrl: producto.imagenUrl || "",
        estado: producto.estado || "activo",
      })
      if (producto.imagenUrl) setImagePreview(producto.imagenUrl)
    }
  }, [producto])

  const handleChange = (e) => {
    const { name, value } = e.target

    // Validación específica para campos numéricos
    if (name === "precio") {
      if (!/^\d*\.?\d*$/.test(value)) {
        return // No actualizar si no son números o punto decimal
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setFormData((prev) => ({ ...prev, imagenUrl: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validateCurrentStep = () => {
    const newErrors = {}

    if (currentStep === 1) {
      if (!formData.nombre.trim()) {
        newErrors.nombre = "El nombre es obligatorio"
      }

      if (!formData.precio.trim()) {
        newErrors.precio = "El precio es obligatorio"
      } else if (isNaN(Number.parseFloat(formData.precio)) || Number.parseFloat(formData.precio) <= 0) {
        newErrors.precio = "El precio debe ser un número mayor que cero"
      }
    } else if (currentStep === 2) {
      if (!formData.Id_Categoria) {
        newErrors.Id_Categoria = "Debe seleccionar una categoría"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateForm = async () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (!formData.precio.trim()) {
      newErrors.precio = "El precio es obligatorio"
    } else if (isNaN(Number.parseFloat(formData.precio)) || Number.parseFloat(formData.precio) <= 0) {
      newErrors.precio = "El precio debe ser un número mayor que cero"
    }

    if (!formData.Id_Categoria) {
      newErrors.Id_Categoria = "Debe seleccionar una categoría"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Preparar los datos para enviar
      const productoData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: Number.parseFloat(formData.precio),
        Id_Categoria: Number.parseInt(formData.Id_Categoria),
        estado: formData.estado,
        imagenUrl: formData.imagenUrl,
      }

      console.log("Datos a enviar:", productoData)
      console.log("ID de categoría seleccionada:", productoData.Id_Categoria)
      console.log("Categorías disponibles:", categorias)

      let resultado
      if (producto && producto.id) {
        resultado = await updateProducto(producto.id, productoData)
        setShowSuccessMessage(true)

        // Mostrar mensaje de éxito por 2 segundos antes de cerrar
        setTimeout(() => {
          if (typeof onSave === "function") {
            onSave(resultado)
          }
          onClose()
        }, 2000)
      } else {
        resultado = await createProducto(productoData)
        if (typeof onSave === "function") {
          onSave(resultado)
        }
        onClose()
      }

      console.log("Respuesta del servidor:", resultado)
    } catch (error) {
      console.error("Error al guardar producto:", error)
      setSubmitError(error.message || "Error al guardar el producto")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formFieldsByStep = {
    1: [
      {
        type: "text",
        name: "nombre",
        label: "Nombre del producto",
        value: formData.nombre,
        error: errors.nombre,
        icon: <Package size={18} className="text-orange-400" />,
      },
      {
        type: "textarea",
        name: "descripcion",
        label: "Descripción (opcional)",
        value: formData.descripcion,
        error: errors.descripcion,
        icon: <AlignLeft size={18} className="text-orange-400" />,
      },
      {
        type: "text",
        name: "precio",
        label: "Precio",
        value: formData.precio,
        error: errors.precio,
        icon: <DollarSign size={18} className="text-orange-400" />,
      },
    ],
    2: [
      {
        type: "select",
        name: "Id_Categoria",
        label: "Categoría",
        value: formData.Id_Categoria,
        error: errors.Id_Categoria,
        icon: <TagIcon size={18} className="text-orange-400" />,
        options: categorias.map((cat) => ({ value: cat.id, label: cat.nombre })),
        loading: loadingCategorias,
      },
      {
        type: "select",
        name: "estado",
        label: "Estado",
        value: formData.estado,
        options: [
          { value: "activo", label: "Activo" },
          { value: "inactivo", label: "Inactivo" },
        ],
        icon:
          formData.estado === "activo" ? (
            <CheckCircle size={18} className="text-green-400" />
          ) : (
            <AlertCircle size={18} className="text-red-400" />
          ),
      },
      {
        type: "image",
        name: "imagen",
        label: "Imagen (opcional)",
        preview: imagePreview,
      },
    ],
  }

  const renderFormField = (field) => {
    if (field.type === "select") {
      return (
        <div key={field.name} className="mb-4">
          <label className="block text-gray-300 mb-1.5 font-medium text-sm">{field.label}</label>
          <div className="relative">
            {field.icon && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{field.icon}</div>
            )}
            <select
              name={field.name}
              value={field.value}
              onChange={handleChange}
              className={`w-full bg-gray-800 text-white border ${
                field.error ? "border-red-500" : "border-gray-700"
              } rounded-lg ${field.icon ? "pl-10" : "pl-3"} p-2.5`}
              disabled={isSubmitting || field.loading}
            >
              <option value="">Seleccionar {field.label.toLowerCase()}</option>
              {field.options &&
                field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>
          {field.error && <p className="mt-1 text-sm text-red-500">{field.error}</p>}
          {field.loading && <p className="mt-1 text-sm text-gray-400">Cargando opciones...</p>}
        </div>
      )
    }

    if (field.type === "textarea") {
      return (
        <div key={field.name} className="mb-4">
          <label className="block text-gray-300 mb-1.5 font-medium text-sm">{field.label}</label>
          <textarea
            name={field.name}
            value={field.value}
            onChange={handleChange}
            className={`w-full bg-gray-800 text-white border ${
              field.error ? "border-red-500" : "border-gray-700"
            } rounded-lg p-2.5`}
            rows="3"
            disabled={isSubmitting}
          ></textarea>
          {field.error && <p className="mt-1 text-sm text-red-500">{field.error}</p>}
        </div>
      )
    }

    if (field.type === "image") {
      return (
        <div key={field.name} className="mb-4">
          <label className="block text-gray-300 mb-1.5 font-medium text-sm">{field.label}</label>
          <div className="flex items-center space-x-4">
            <div className="relative w-24 h-24 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              {field.preview ? (
                <img src={field.preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <ImageIcon size={32} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600 transition-colors"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">Formatos: JPG, PNG, GIF</p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={field.name} className="mb-4">
        <label className="block text-gray-300 mb-1.5 font-medium text-sm">{field.label}</label>
        <div className="relative">
          {field.icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{field.icon}</div>
          )}
          <input
            type={field.type}
            name={field.name}
            value={field.value}
            onChange={handleChange}
            className={`w-full bg-gray-800 text-white border ${
              field.error ? "border-red-500" : "border-gray-700"
            } rounded-lg ${field.icon ? "pl-10" : "pl-3"} p-2.5`}
            disabled={isSubmitting}
          />
        </div>
        {field.error && <p className="mt-1 text-sm text-red-500">{field.error}</p>}
      </div>
    )
  }

  const FormSteps = () => (
    <div className="flex justify-center mb-6">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm
              ${
                currentStep === step
                  ? "bg-orange-500 shadow-lg shadow-orange-500/30"
                  : currentStep > step
                    ? "bg-green-500 shadow-lg shadow-green-500/30"
                    : "bg-gray-700"
              }`}
          >
            {step}
          </div>
          {step < totalSteps && (
            <div className={`w-12 h-1 ${currentStep > step ? "bg-green-500" : "bg-gray-700"}`}></div>
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
            {producto ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:rotate-90 transition-all bg-gray-800 p-1.5 rounded-full"
            title="Volver"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {/* Mostrar error de submit */}
          {submitError && (
            <div className="bg-red-900 text-white p-3 rounded-lg mb-4 animate-pulse border border-red-500 text-sm">
              {submitError}
            </div>
          )}

          {/* Mensaje de éxito */}
          {showSuccessMessage && (
            <div className="bg-green-900 text-white p-3 rounded-lg mb-4 border border-green-500 text-sm flex items-center">
              <CheckCircle size={18} className="mr-2 text-green-400" />
              Producto actualizado correctamente
            </div>
          )}

          <FormSteps />

          <form>
            {formFieldsByStep[currentStep].map(renderFormField)}

            <div className="flex justify-between mt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 border border-green-500 ${
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
                    <>
                      <Save size={16} />
                      Guardar
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProductoForm
