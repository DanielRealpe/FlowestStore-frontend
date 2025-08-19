"use client"

import { useState, useEffect } from "react"
import { X, Save, User, Mail, Lock, Shield, CheckCircle, AlertCircle, CreditCard } from "lucide-react"
import { createUsuario, updateUsuario, verificarDuplicado, fetchRoles } from "../api/usuarioService"
import { useTheme } from "../../../components/layout/ThemeContext.jsx"

import { toast } from "react-toastify"

const UserForm = ({ usuario, onClose, onSave }) => {
  const { darkMode } = useTheme()
  const initialFormData = {
    nombre: "",
    email: "",
    password: "",
    cedula: "",
    id_rol: 2, // Valor por defecto para empleado
    estado: "activo",
  }
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre || "",
        email: usuario.email || "",
        cedula: usuario.cedula || "no carga",
        password: "", // No mostrar contraseña actual por seguridad
        id_rol: usuario.id_rol || 2,
        estado: usuario.estado || "activo",
      })
    }
  }, [usuario])

  useEffect(() => {
    const cargarRoles = async () => {
      try {
        setLoading(true)
        const rolesData = await fetchRoles()
        console.log("Roles cargados:", rolesData)
        setRoles(Array.isArray(rolesData) ? rolesData : [])
      } catch (error) {
        console.error("Error al cargar roles:", error)
        toast.error("Error al cargar roles: " + (error.message || "Error desconocido"))
        // Establecer roles vacíos para evitar errores en la interfaz
        setRoles([])
      } finally {
        setLoading(false)
      }
    }

    cargarRoles()
  }, [])


  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Verificar si un campo ya existe en la base de datos
  const checkDuplicate = async (field, value) => {
    if (!value) return false

    try {
      // Si estamos editando, no verificar el mismo usuario
      if (usuario && field === "email" && usuario.email === value) {
        return false
      }
      if (usuario && field === "cedula" && usuario.cedula === value) {
        return false
      }

      const response = await verificarDuplicado(field, value)
      return response.existe
    } catch (error) {
      console.error(`Error al verificar duplicado de ${field}:`, error)
      return false
    }
  }

  const validations = {
    nombre: async (value) => {
      if (!value.trim()) return "El nombre es obligatorio"
      if (value.trim().length < 3) return "El nombre debe tener al menos 3 caracteres"
      if (value.trim().length > 100) return "El nombre debe tener máximo 100 caracteres"
      return ""
    },
    email: async (value) => {
      if (!value.trim()) return "El correo es obligatorio"
      if (!/\S+@\S+\.\S+/.test(value)) return "El correo no es válido"

      // Verificar si el email ya existe
      const duplicado = await checkDuplicate("email", value)
      if (duplicado) return "Este correo electrónico ya está registrado"

      return ""
    },
    cedula: async (value) => {
      if (!value.trim()) return "La cédula es obligatoria"
      if (value.trim().length < 6) return "La cédula debe tener al menos 6 caracteres"
      if (value.trim().length > 15) return "La cédula debe tener máximo 15 caracteres"
      if (!/^\d+$/.test(value)) return "La cédula debe contener solo números"

      // Verificar si la cédula ya existe
      const duplicado = await checkDuplicate("cedula", value)
      if (duplicado) return "Esta cédula ya está registrada"

      return ""
    },
    password: async (value) => {
      // Si estamos editando, la contraseña es opcional
      if (usuario && !value.trim()) return ""
      if (!value.trim()) return "La contraseña es obligatoria"
      if (value.trim().length < 6) return "La contraseña debe tener al menos 6 caracteres"
      return ""
    },
    id_rol: async (value) => {
      if (!value) return "El rol es obligatorio"
      return ""
    },
  }

  const validateCurrentStep = async () => {
    const newErrors = {}
    const fieldsToValidate = currentStep === 1 ? ["nombre", "email", "cedula"] : ["password", "id_rol"]

    for (const field of fieldsToValidate) {
      if (validations[field]) {
        const error = await validations[field](formData[field])
        if (error) newErrors[field] = error
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateForm = async () => {
    const newErrors = {}

    for (const field of Object.keys(validations)) {
      const error = await validations[field](formData[field])
      if (error) newErrors[field] = error
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submitForm = async () => {
    if (formSubmitted) return
    setFormSubmitted(true)

    if (!(await validateForm())) {
      setFormSubmitted(false)
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Si estamos editando y no se ha cambiado la contraseña, no la enviamos
      const dataToSend = { ...formData }
      if (usuario && !dataToSend.password) {
        delete dataToSend.password
      }

      let savedUsuario
      if (usuario) {
        savedUsuario = await updateUsuario(usuario.id, dataToSend)
        setShowSuccessMessage(true)
        toast.success(`Usuario ${formData.nombre} actualizado correctamente`)

        // Mostrar mensaje de éxito por 2 segundos antes de cerrar
        if (typeof onSave === "function") {
          onSave(savedUsuario)
        }
        onClose()
      } else {
        savedUsuario = await createUsuario(dataToSend)
        toast.success(`Usuario ${formData.nombre} creado correctamente`)

        if (typeof onSave === "function") {
          onSave(savedUsuario)
        }
        onClose()
      }
    } catch (error) {
      toast.error(error.message || "Error al guardar el usuario")
      setFormSubmitted(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = async () => {
    if (await validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const formFieldsByStep = {
    1: [
      {
        type: "text",
        name: "nombre",
        label: "Nombre Completo",
        value: formData.nombre,
        error: errors.nombre,
        icon: <User size={18} className="text-indigo-500" />,
      },
      {
        type: "email",
        name: "email",
        label: "Correo Electrónico",
        value: formData.email,
        error: errors.email,
        icon: <Mail size={18} className="text-indigo-500" />,
      },
      {
        type: "text",
        name: "cedula",
        label: "Cédula",
        value: formData.cedula,
        error: errors.cedula,
        icon: <CreditCard size={18} className="text-indigo-500" />,
        maxLength: 15,
        pattern: "[0-9]*",
        inputMode: "numeric",
      },
    ],
    2: [
      {
        type: "password",
        name: "password",
        label: usuario ? "Nueva Contraseña (opcional)" : "Contraseña",
        value: formData.password,
        error: errors.password,
        icon: <Lock size={18} className="text-indigo-500" />,
        required: !usuario,
      },
      {
        type: "select",
        name: "id_rol",
        label: "Rol",
        value: formData.id_rol,
        error: errors.id_rol,
        icon: <Shield size={18} className="text-indigo-500" />,
        options: roles.length > 0 ? roles.map((rol) => ({ value: rol.id, label: rol.nombre })) : [],
        loading: loading,
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
            <CheckCircle size={18} className="text-green-500" />
          ) : (
            <AlertCircle size={18} className="text-red-500" />
          ),
      },
    ],
  }

  const renderFormField = (field) => {
    if (field.type === "select") {
      return (
        <div key={field.name} className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-1">{field.label}</label>
          <div className="relative">
            {field.icon && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{field.icon}</div>
            )}
            <select
              name={field.name}
              value={field.value}
              onChange={handleChange}
              className={`bg-gray-800 text-white ${field.icon ? "pl-10" : "pl-3"} w-full p-2 rounded-lg border ${field.error ? "border-red-500" : "border-gray-700"
                } focus:border-orange-500 focus:outline-none`}
              disabled={field.loading}
            >
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {field.error && <p className="text-red-500 text-xs mt-1">{field.error}</p>}
          {field.loading && <p className="text-gray-400 text-xs mt-1">Cargando opciones...</p>}
        </div>
      )
    }

    return (
      <div key={field.name} className="mb-4">
        <label className="block text-sm font-medium text-gray-400 mb-1">{field.label}</label>
        <div className="relative">
          {field.icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{field.icon}</div>
          )}
          <input
            type={field.type}
            name={field.name}
            value={field.value}
            onChange={handleChange}
            required={field.required}
            maxLength={field.maxLength}
            pattern={field.pattern}
            inputMode={field.inputMode}
            className={`bg-gray-800 text-white ${field.icon ? "pl-10" : "pl-3"} w-full p-2 rounded-lg border ${field.error ? "border-red-500" : "border-gray-700"
              } focus:border-orange-500 focus:outline-none`}
          />
        </div>
        {field.error && <p className="text-red-500 text-xs mt-1">{field.error}</p>}
      </div>
    )
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
            <div className={`w-12 h-1 ${currentStep > step ? "bg-green-500" : "bg-gray-700"}`}></div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`rounded-xl shadow-xl w-full max-w-md transform transition-all ${
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
              <User size={18} />
            </span>
            {usuario ? "Editar Usuario" : "Registrar Usuario"}
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

        <div className="p-6">
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

          {/* Steps */}
          <div className="flex justify-center mb-8 px-4">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  transition-all duration-300 ${
                    currentStep === step
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
                  <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
                    currentStep > step
                      ? "bg-gradient-to-r from-green-500 to-green-600"
                      : darkMode
                        ? "bg-gray-700"
                        : "bg-slate-200"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Title */}
          <div className="text-center mb-6">
            <h3 className={`text-lg font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
              {currentStep === 1 ? "Información Personal" : "Rol y Contraseña"}
            </h3>
            <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-slate-500'
              }`}>
              {currentStep === 1
                ? "Datos básicos del usuario"
                : "Información de rol y seguridad"}
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {formFieldsByStep[currentStep].map(renderFormField)}
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-8 gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className={`px-6 py-2.5 rounded-lg border transition-all duration-200 ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600
                       text-white hover:from-indigo-600 hover:to-purple-700
                       transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                onClick={submitForm}
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
                {isSubmitting
                  ? "Guardando..."
                  : usuario
                    ? "Actualizar"
                    : "Guardar"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserForm
