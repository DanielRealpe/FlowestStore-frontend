// --- START OF FILE ProductoForm.jsx (MODIFICADO) ---

"use client"

import { useState, useEffect } from "react"
import { X, Save, Package, DollarSign, Tag, AlignLeft, CheckCircle, AlertCircle, ImageIcon } from "lucide-react"
import { createProducto, updateProducto } from "../api/ProductoService"
import { fetchCategorias } from "../../categorias/api/categoriaService"
import { toast } from "react-toastify"
import { useTheme } from "../../../components/layout/ThemeContext.jsx"
import FormField from "../../clientes/components/form/FormField"
import SelectField from "../../clientes/components/form/SelectField"

const ProductoForm = ({ producto, onClose, onSave }) => {
  const { darkMode } = useTheme()

  const initialFormData = {
    nombre: "",
    descripcion: "",
    precio: "",
    Id_Categoria: "",
    estado: "activo",
  }

  const [formData, setFormData] = useState(initialFormData)
  const [imageFile, setImageFile] = useState(null) // 👈 1. Estado para el archivo de imagen
  const [imagePreview, setImagePreview] = useState("")
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2
  const [categorias, setCategorias] = useState([])
  const [loadingCategorias, setLoadingCategorias] = useState(false)

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        setLoadingCategorias(true)
        const data = await fetchCategorias()
        setCategorias(data.data || [])
      } catch (error) {
        toast.error("No se pudieron cargar las categorías.")
        console.error("Error al cargar categorías:", error)
      } finally {
        setLoadingCategorias(false)
      }
    }
    loadCategorias()

    if (producto) {
      setFormData({
        nombre: producto.nombre || "",
        descripcion: producto.descripcion || "",
        precio: producto.precio?.toString() || "",
        Id_Categoria: producto.Id_Categoria || "",
        estado: producto.estado || "activo",
      })
      if (producto.imagenUrl) {
        setImagePreview(producto.imagenUrl) // Usar la URL existente para la vista previa
      }
    }
  }, [producto])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "precio" && !/^\d*\.?\d*$/.test(value)) {
      return
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 👈 2. Guardar el archivo y generar la vista previa
      setImageFile(file) // Guardamos el objeto File
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result) // Usamos el resultado para la vista previa
      }
      reader.readAsDataURL(file)
    }
  }

  const validateStep = (step) => {
    // ... (sin cambios en la validación)
    const newErrors = {}
    if (step === 1) {
      if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio"
      if (!formData.descripcion.trim()) newErrors.descripcion = "La descripción es obligatoria"
      if (!formData.precio.trim()) newErrors.precio = "El precio es obligatorio"
      else if (isNaN(Number(formData.precio)) || Number(formData.precio) <= 0) newErrors.precio = "El precio debe ser un número positivo"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!formData.Id_Categoria) newErrors.Id_Categoria = "Debe seleccionar una categoría"

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      toast.error("Por favor, completa todos los campos obligatorios.")
      return
    }
    setIsSubmitting(true)
    setSubmitError("")

    // 👈 3. Construir el objeto FormData
    const formDataToSend = new FormData()
    formDataToSend.append("nombre", formData.nombre)
    formDataToSend.append("descripcion", formData.descripcion)
    formDataToSend.append("precio", parseFloat(formData.precio))
    formDataToSend.append("Id_Categoria", Number(formData.Id_Categoria))
    formDataToSend.append("estado", formData.estado)

    if (imageFile) {
      // El nombre 'imagen' debe coincidir con el del backend: upload.single('imagen')
      formDataToSend.append("imagen", imageFile)
    }

    try {
      if (producto && producto.id) {
        await updateProducto(producto.id, formDataToSend) // Enviar FormData
        toast.success(`Producto "${formData.nombre}" actualizado exitosamente`)
      } else {
        await createProducto(formDataToSend) // Enviar FormData
        toast.success(`Producto "${formData.nombre}" creado exitosamente`)
      }
      onSave()
    } catch (error) {
      const errorMsg = error.message || "Error al guardar el producto"
      setSubmitError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    } else {
      toast.warning("Por favor, completa correctamente los campos.")
    }
  }

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  // --- El resto del JSX no necesita cambios ---
  // ... (pega aquí el resto de tu componente JSX desde el `return`)
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className={`rounded-xl shadow-xl w-full max-w-md transform transition-all ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border-slate-200"
          }`}
      >
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${darkMode ? "border-gray-700" : "border-slate-200"}`}>
          <h2 className={`text-xl font-semibold flex items-center gap-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-lg shadow-lg">
              <Package size={18} />
            </span>
            {producto ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-all ${darkMode
              ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {submitError && (
            <div
              className={`p-4 rounded-lg mb-6 border text-sm ${darkMode
                ? "bg-red-900/20 border-red-500/30 text-red-300"
                : "bg-red-50 border-red-200 text-red-700"
                }`}
            >
              {submitError}
            </div>
          )}

          {/* Steps */}
          <div className="flex justify-center mb-8 px-4">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${currentStep === step
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                    : currentStep > step
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30"
                      : darkMode
                        ? "bg-gray-700 text-gray-400"
                        : "bg-slate-100 text-slate-400"
                    }`}
                >
                  {currentStep > step ? "✓" : step}
                </div>
                {step < totalSteps && (
                  <div
                    className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${currentStep > step
                      ? "bg-gradient-to-r from-green-500 to-green-600"
                      : darkMode
                        ? "bg-gray-700"
                        : "bg-slate-200"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-6">
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
              {currentStep === 1 ? "Información Básica" : "Detalles Adicionales"}
            </h3>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
              {currentStep === 1 ? "Datos principales del producto" : "Categoría, estado e imagen"}
            </p>
          </div>

          <form>
            <div className="space-y-4">
              {currentStep === 1 && (
                <>
                  <FormField
                    type="text"
                    name="nombre"
                    label="Nombre del producto"
                    value={formData.nombre}
                    error={errors.nombre}
                    onChange={handleChange}
                    icon={<Package size={18} className={darkMode ? "text-gray-400" : "text-slate-400"} />}
                  />
                  <FormField
                    type="textarea"
                    name="descripcion"
                    label="Descripción"
                    value={formData.descripcion}
                    error={errors.descripcion}
                    onChange={handleChange}
                    icon={<AlignLeft size={18} className={darkMode ? "text-gray-400" : "text-slate-400"} />}
                  />
                  <FormField
                    type="text"
                    name="precio"
                    label="Precio"
                    value={formData.precio}
                    error={errors.precio}
                    onChange={handleChange}
                    icon={<DollarSign size={18} className={darkMode ? "text-gray-400" : "text-slate-400"} />}
                    inputMode="decimal"
                  />
                </>
              )}
              {currentStep === 2 && (
                <>
                  <SelectField
                    name="Id_Categoria"
                    label="Categoría"
                    value={formData.Id_Categoria}
                    error={errors.Id_Categoria}
                    onChange={handleChange}
                    options={[
                      { value: "", label: loadingCategorias ? "Cargando..." : "Seleccionar categoría" },
                      ...categorias.map((cat) => ({ value: cat.id, label: cat.nombre })),
                    ]}
                    icon={<Tag size={18} className={darkMode ? "text-gray-400" : "text-slate-400"} />}
                  />
                  <SelectField
                    name="estado"
                    label="Estado"
                    value={formData.estado}
                    onChange={handleChange}
                    options={[
                      { value: "activo", label: "Activo" },
                      { value: "inactivo", label: "Inactivo" },
                    ]}
                    icon={
                      formData.estado === "activo" ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : (
                        <AlertCircle size={18} className="text-red-500" />
                      )
                    }
                  />
                  <div>
                    <label className={`block mb-1.5 font-medium text-sm ${darkMode ? "text-gray-300" : "text-slate-700"}`}>
                      Imagen (opcional)
                    </label>
                    <div className="flex items-center gap-4">
                      <div
                        className={`relative w-24 h-24 rounded-lg overflow-hidden border ${darkMode ? "bg-gray-900 border-gray-600" : "bg-slate-50 border-slate-300"
                          }`}
                      >
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className={`w-full h-full flex items-center justify-center ${darkMode ? "text-gray-500" : "text-slate-400"
                              }`}
                          >
                            <ImageIcon size={32} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <label
                          htmlFor="image-upload"
                          className={`cursor-pointer inline-block text-sm font-semibold px-4 py-2 rounded-lg border transition-colors ${darkMode
                            ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                            : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                          Seleccionar...
                        </label>
                        <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-between mt-8 gap-4">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className={`px-6 py-2.5 rounded-lg border transition-all duration-200 ${darkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
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
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white transition-all duration-200 ${isSubmitting
                    ? darkMode
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/20 hover:shadow-green-500/30"
                    }`}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {isSubmitting ? "Guardando..." : producto ? "Actualizar" : "Guardar"}
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