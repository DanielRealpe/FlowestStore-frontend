"use client"

import { useState, useEffect } from "react"
import { X, Save, User, Mail, Phone, MapPin, CheckCircle, AlertCircle } from "lucide-react"
import { createCliente, updateCliente } from "../api/clienteService"
import FormField from "./form/FormField"
import SelectField from "./form/SelectField"
import { toast } from "react-toastify" // Importar toast

const ClienteForm = ({ cliente, onClose, onSave }) => {
  const initialFormData = {
    nombreCompleto: "",
    tipoDocumento: "cc", // Cambiado a minúsculas para coincidir con el backend
    documentoIdentidad: "",
    correoElectronico: "",
    telefono: "",
    direccion: "",
    genero: "masculino",
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
      // Mapear los valores del cliente a los valores esperados por el backend
      let tipoDoc = cliente.tipoDocumento || "cc"
      // Convertir valores antiguos a nuevos si es necesario
      if (tipoDoc === "CC") tipoDoc = "cc"
      if (tipoDoc === "TI") tipoDoc = "tarjeta identidad"
      if (tipoDoc === "Pasaporte") tipoDoc = "passport"
      if (tipoDoc === "CE") tipoDoc = "cc" // Fallback a cc si es CE

      setFormData({
        nombreCompleto: cliente.nombreCompleto || "",
        tipoDocumento: tipoDoc,
        documentoIdentidad: cliente.documentoIdentidad || "",
        correoElectronico: cliente.correoElectronico || "",
        telefono: cliente.telefono || "",
        direccion: cliente.direccion || "",
        genero: cliente.genero || "masculino",
        estado: cliente.estado || "activo",
      })
    }
  }, [cliente])

  const handleChange = (e) => {
    const { name, value } = e.target

    // Validación específica para campos numéricos
    if (name === "telefono" && !/^\d*$/.test(value)) {
      return // No actualizar si no son solo números
    }

    // Limitar longitud para documentoIdentidad y teléfono
    if (name === "documentoIdentidad" && value.length > 10) {
      return // No permitir más de 10 caracteres
    }

    if (name === "telefono" && value.length > 10) {
      return // No permitir más de 10 caracteres
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
    genero: (value) => {
      if (!value) return "El género es obligatorio"
      if (!["masculino", "femenino", "0tro"].includes(value)) {
        return "El género debe ser masculino, femenino u 0tro"
      }
      return ""
    },
    tipoDocumento: (value) => {
      if (!value) return "El tipo de documento es obligatorio"
      if (!["cc", "tarjeta identidad", "passport"].includes(value)) {
        return "El tipo de documento debe ser cc, tarjeta identidad o passport"
      }
      return ""
    },
  }

  const validateCurrentStep = () => {
    const newErrors = {}
    const fieldsToValidate =
      currentStep === 1
        ? ["nombreCompleto", "tipoDocumento", "documentoIdentidad", "correoElectronico"]
        : ["telefono", "direccion", "genero"]

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

  // Función para enviar el formulario - solo se llama en el último paso
  const submitForm = async () => {
    if (formSubmitted) return
    setFormSubmitted(true)

    if (!validateForm()) {
      setFormSubmitted(false)
      // Mostrar notificación toast para errores de validación
      toast.error("Por favor, corrige los errores en el formulario")
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      let savedCliente;
      if (cliente) {
        savedCliente = await updateCliente(cliente.id, formData)
        // Toast para actualización exitosa
        toast.success(`Cliente ${formData.nombreCompleto} actualizado exitosamente`)
      } else {
        console.log("Datos enviados:", formData)
        savedCliente = await createCliente(formData)
        // Toast para creación exitosa
        toast.success(`Cliente ${formData.nombreCompleto} registrado exitosamente`)
      }

      // Asegurar que onSave se llame con los datos actualizados del cliente
      if (typeof onSave === 'function') {
        onSave(savedCliente);
      }
      
      // Cerrar el formulario después de guardar exitosamente
      onClose();
    } catch (error) {
      console.error("Error al guardar cliente:", error)
      // Mostrar el mensaje de error específico en un toast
      const errorMsg = error.message || "Error al guardar el cliente"
      toast.error(errorMsg)
      setSubmitError(errorMsg)
      setFormSubmitted(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para avanzar al siguiente paso
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    } else {
      // Toast para errores de validación del paso actual
      toast.warning("Por favor, completa correctamente todos los campos")
    }
  }

  // Función para retroceder al paso anterior
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
        icon: <User size={18} className="text-orange-400" />,
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
        icon: <Mail size={18} className="text-orange-400" />,
      },
    ],
    2: [
      {
        type: "text",
        name: "telefono",
        label: "Teléfono",
        value: formData.telefono,
        error: errors.telefono,
        icon: <Phone size={18} className="text-orange-400" />,
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
        icon: <MapPin size={18} className="text-orange-400" />,
      },
      {
        type: "select",
        name: "genero",
        label: "Género",
        value: formData.genero,
        error: errors.genero,
        options: [
          { value: "masculino", label: "Masculino" },
          { value: "femenino", label: "Femenino" },
          { value: "0tro", label: "Otro" }, // Nota: Usando "0tro" con un cero como está en el backend
        ],
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
              <User size={16} />
            </span>
            {cliente ? "Editar Cliente" : "Registrar Cliente"}
          </h2>
          <button
            onClick={() => {
              onClose();
              toast.info("Operación cancelada");
            }}
            className="text-gray-400 hover:text-white hover:rotate-90 transition-all bg-gray-800 p-1.5 rounded-full"
            title="Volver"
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
            {formFieldsByStep[currentStep].map(renderFormField)}

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
                  {cliente ? "Actualizar" : "Guardar"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClienteForm