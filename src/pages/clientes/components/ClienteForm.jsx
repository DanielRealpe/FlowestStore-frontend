"use client"

import { useState, useEffect } from "react"
import { X, Save, User, Mail, Phone, MapPin, CheckCircle, AlertCircle, Lock } from "lucide-react"
import { createCliente, updateCliente } from "../api/clienteService"
import FormField from "./form/FormField"
import SelectField from "./form/SelectField"
import { toast } from "react-toastify"
import { useTheme } from "../../../components/layout/ThemeContext.jsx" // Ajusta la ruta según tu estructura

const ClienteForm = ({ cliente, onClose, onSave }) => {
  const { darkMode } = useTheme()
  
  const initialFormData = {
    nombreCompleto: "",
    tipoDocumento: "cc",
    documentoIdentidad: "",
    correoElectronico: "",
    telefono: "",
    direccion: "",
    password: "",
    estado: "activo",
  }

  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2
  const [formSubmitted, setFormSubmitted] = useState(false)

  useEffect(() => {
    if (cliente) {
      let tipoDoc = cliente.tipoDocumento || "cc"
      if (tipoDoc === "CC") tipoDoc = "cc"
      if (tipoDoc === "TI") tipoDoc = "tarjeta identidad"
      if (tipoDoc === "Pasaporte") tipoDoc = "passport"
      if (tipoDoc === "CE") tipoDoc = "cc"

      setFormData({
        nombreCompleto: cliente.nombreCompleto || "",
        tipoDocumento: tipoDoc,
        documentoIdentidad: cliente.documentoIdentidad || "",
        correoElectronico: cliente.correoElectronico || "",
        telefono: cliente.telefono || "",
        direccion: cliente.direccion || "",
        password: "",
        estado: cliente.estado || "activo",
      })
    }
  }, [cliente])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "telefono" && !/^\d*$/.test(value)) {
      return
    }

    if (name === "documentoIdentidad" && value.length > 10) {
      return
    }

    if (name === "telefono" && value.length > 10) {
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validations = {
    nombreCompleto: (value) => {
      if (!value.trim()) return "El nombre es obligatorio"
      if (value.trim().length < 3) return "El nombre debe tener al menos 3 caracteres"
      if (value.trim().length > 100) return "El nombre debe tener máximo 100 caracteres"
      return ""
    },
    documentoIdentidad: (value) => {
      if (!value.trim()) return "El documento es obligatorio"
      if (value.trim().length < 6) return "El documento debe tener al menos 6 caracteres"
      if (value.trim().length > 10) return "El documento debe tener máximo 10 caracteres"
      return ""
    },
    correoElectronico: (value) => {
      if (!value.trim()) return "El correo es obligatorio"
      if (!/\S+@\S+\.\S+/.test(value)) return "El correo no es válido"
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org)$/i.test(value)) {
        return "El correo debe terminar en .com, .net o .org"
      }
      return ""
    },
    telefono: (value) => {
      if (!value.trim()) return "El teléfono es obligatorio"
      if (!/^\d+$/.test(value)) return "El teléfono debe contener solo números"
      if (value.trim().length !== 10) return "El teléfono debe tener exactamente 10 dígitos"
      return ""
    },
    direccion: (value) => {
      if (!value.trim()) return "La dirección es obligatoria"
      if (value.trim().length < 5) return "La dirección debe tener al menos 5 caracteres"
      if (value.trim().length > 200) return "La dirección debe tener máximo 200 caracteres"
      return ""
    },
    tipoDocumento: (value) => {
      if (!value) return "El tipo de documento es obligatorio"
      if (!["cc", "tarjeta identidad", "passport"].includes(value)) {
        return "El tipo de documento debe ser cc, tarjeta identidad o passport"
      }
      return ""
    },
    password: (value) => {
      if (!cliente && !value.trim()) return "La contraseña es obligatoria"
      if (value && value.length < 6) return "La contraseña debe tener al menos 6 caracteres"
      return ""
    },
  }

  const validateCurrentStep = () => {
    const newErrors = {}
    const fieldsToValidate =
      currentStep === 1
        ? ["nombreCompleto", "tipoDocumento", "documentoIdentidad", "correoElectronico", "password"]
        : ["telefono", "direccion"]

    fieldsToValidate.forEach((field) => {
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
    Object.keys(validations).forEach((field) => {
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
      let savedCliente
      let dataToSend = { ...formData }
      if (cliente && !formData.password) {
        delete dataToSend.password
      }
      if (cliente) {
        savedCliente = await updateCliente(cliente.id, dataToSend)
        toast.success(`Cliente ${formData.nombreCompleto} actualizado exitosamente`)
      } else {
        console.log("Datos enviados:", formData)
        savedCliente = await createCliente(dataToSend)
        toast.success(`Cliente ${formData.nombreCompleto} registrado exitosamente`)
      }

      if (typeof onSave === 'function') {
        onSave(savedCliente);
      }

      onClose();
    } catch (error) {
      console.error("Error al guardar cliente:", error)
      const errorMsg = error.message || "Error al guardar el cliente"
      toast.error(errorMsg)
      setSubmitError(errorMsg)
      setFormSubmitted(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    } else {
      toast.warning("Por favor, completa correctamente todos los campos")
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const formFieldsByStep = {
    1: [
      {
        type: "text",
        name: "nombreCompleto",
        label: "Nombre Completo",
        value: formData.nombreCompleto,
        error: errors.nombreCompleto,
        icon: <User size={18} className="text-indigo-500" />,
      },
      {
        type: "document-group",
        fields: [
          {
            type: "select",
            name: "tipoDocumento",
            label: "Tipo",
            value: formData.tipoDocumento,
            error: errors.tipoDocumento,
            options: [
              { value: "cc", label: "Cédula de Ciudadanía" },
              { value: "tarjeta identidad", label: "Tarjeta de Identidad" },
              { value: "passport", label: "Pasaporte" },
            ],
          },
          {
            type: "text",
            name: "documentoIdentidad",
            label: "Documento",
            value: formData.documentoIdentidad,
            error: errors.documentoIdentidad,
            maxLength: 10,
          },
        ],
      },
      {
        type: "email",
        name: "correoElectronico",
        label: "Correo Electrónico",
        value: formData.correoElectronico,
        error: errors.correoElectronico,
        icon: <Mail size={18} className="text-indigo-500" />,
      },
      {
        type: "password",
        name: "password",
        label: "Contraseña",
        value: formData.password,
        error: errors.password,
        icon: <Lock size={18} className="text-indigo-500" />,
        placeholder: cliente
          ? "Dejar en blanco para mantener la contraseña actual"
          : "Mínimo 6 caracteres",
        autoComplete: "new-password",
      },
    ],
    2: [
      {
        type: "text",
        name: "telefono",
        label: "Teléfono",
        value: formData.telefono,
        error: errors.telefono,
        icon: <Phone size={18} className="text-indigo-500" />,
        maxLength: 10,
        pattern: "[0-9]*",
        inputMode: "numeric",
      },
      {
        type: "text",
        name: "direccion",
        label: "Dirección",
        value: formData.direccion,
        error: errors.direccion,
        icon: <MapPin size={18} className="text-indigo-500" />,
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
    if (field.type === "document-group") {
      return (
        <div key="document-group" className="mb-4">
          <div className="flex flex-row space-x-2">
            <div className="w-1/3">
              <SelectField {...field.fields[0]} onChange={handleChange} />
            </div>
            <div className="w-2/3">
              <FormField {...field.fields[1]} onChange={handleChange} />
            </div>
          </div>
        </div>
      )
    }

    if (field.type === "select") {
      return <SelectField key={field.name} {...field} onChange={handleChange} />
    }

    return <FormField key={field.name} {...field} onChange={handleChange} />
  }

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
            {cliente ? "Editar Cliente" : "Registrar Cliente"}
          </h2>
          <button
            onClick={() => {
              onClose();
            }}
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
              {currentStep === 1 ? "Información Personal" : "Contacto y Estado"}
            </h3>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-slate-500'
            }`}>
              {currentStep === 1 
                ? "Datos básicos del cliente" 
                : "Información de contacto y configuración"
              }
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
                  : cliente 
                    ? "Actualizar" 
                    : "Guardar"
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClienteForm