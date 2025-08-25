"use client"

import { useState, useEffect } from "react"
import { X, Save, Tag, AlignLeft, CheckCircle, AlertCircle } from "lucide-react"
import { createCategoria, updateCategoria, fetchCategorias } from "../api/categoriaService"
import { toast } from "react-toastify"
import { useTheme } from "../../../components/layout/ThemeContext.jsx" // Asegúrate que la ruta sea correcta
import FormField from "../../clientes/components/form/FormField" // Reutilizando el componente estandarizado
import SelectField from "../../clientes/components/form/SelectField" // Reutilizando el componente estandarizado

const CategoriaForm = ({ categoria, onClose, onSave }) => {
  const { darkMode } = useTheme()

  const initialFormData = {
    nombre: "",
    descripcion: "",
    estado: "activo",
  }

  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const data = await fetchCategorias()
        setCategorias(data.data || [])
      } catch (error) {
        console.error("Error al cargar categorías:", error)
        toast.error("Error al cargar categorías")
      } finally {
        setLoading(false)
      }
    }
    loadCategorias()
    if (categoria) {
      setFormData({
        nombre: categoria.nombre || "",
        descripcion: categoria.descripcion || "",
        estado: categoria.estado || "activo",
      })
    }
  }, [categoria])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const regex = /^[A-Za-z\s]+$/;
    const newErrors = {};
    if (!regex.test(formData.nombre)) {
      newErrors.nombre = "No le metiste con cojones";
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres"
    } else if (
    categorias.some(
      (c) => c.nombre.trim().toLowerCase() === formData.nombre.trim().toLowerCase()
    )
  ) {
    newErrors.nombre = "Ya existe una categoría con este nombre"
  } else if (!formData.descripcion.trim()){
      newErrors.descripcion = "La descripción es obligatoria"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario.")
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      const categoryData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        estado: formData.estado,
      }

      if (categoria && categoria.id) {
        await updateCategoria(categoria.id, categoryData)
        toast.success(`Categoría "${formData.nombre}" actualizada exitosamente`)
      } else {
        await createCategoria(categoryData)
        toast.success(`Categoría "${formData.nombre}" creada exitosamente`)
      }
      onSave()
    } catch (error) {
      const errorMsg = error.message || "Error al guardar la categoría"
      setSubmitError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className={`rounded-xl shadow-xl w-full max-w-md transform transition-all ${
          darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border-slate-200"
        }`}
      >
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${darkMode ? "border-gray-700" : "border-slate-200"}`}>
          <h2 className={`text-xl font-semibold flex items-center gap-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-lg shadow-lg">
              <Tag size={18} />
            </span>
            {categoria ? "Editar Categoría" : "Nueva Categoría"}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-all ${
              darkMode
                ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {submitError && (
            <div
              className={`p-4 rounded-lg mb-6 border text-sm ${
                darkMode
                  ? "bg-red-900/20 border-red-500/30 text-red-300"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {submitError}
            </div>
          )}

          <div className="space-y-4">
            <FormField
              type="text"
              name="nombre"
              label="Nombre de la categoría"
              value={formData.nombre}
              error={errors.nombre}
              onChange={handleChange}
              icon={<Tag size={18} className={darkMode ? "text-gray-400" : "text-slate-400"} />}
            />
            <FormField
              type="textarea" // El componente FormField debe soportar `type="textarea"` o usar un componente `TextAreaField`
              name="descripcion"
              label="Descripción"
              value={formData.descripcion}
              error={errors.descripcion}
              onChange={handleChange}
              icon={<AlignLeft size={18} className={darkMode ? "text-gray-400" : "text-slate-400"} />}
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
          </div>

          {/* Buttons */}
          <div className="flex justify-end mt-8 gap-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2.5 rounded-lg border transition-all duration-200 ${
                darkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {isSubmitting ? "Guardando..." : categoria ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoriaForm
