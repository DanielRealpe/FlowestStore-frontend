import { useState, useRef, useEffect } from "react"
import { toast } from "react-toastify"
import { X, ShoppingBag, User, Phone, Mail, MapPin, CreditCard, Package, CheckCircle, AlertCircle } from "lucide-react"
import { useCart } from "./cartContext"
import { createPedido } from "../pedidos/api/pedidoservice.js"
import { useAuth } from "../usuarios/context/AuthContext"

export default function PedidoCustomerModal({ open, onClose, onPedidoGuardado }) {
    const { state, dispatch } = useCart()
    const { user, isAuthenticated } = useAuth()
    const [form, setForm] = useState({
        nombreCompleto: "",
        documentoIdentidad: "",
        direccion_envio: "",
        telefono: "",
        email: "",
    })
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState("")
    const [showForm, setShowForm] = useState(open)
    const [currentStep, setCurrentStep] = useState(1)
    const modalRef = useRef(null)

    // Cerrar modal con ESC o click fuera
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === "Escape") handleClose()
        }
        function handleClickOutside(e) {
            if (modalRef.current && !modalRef.current.contains(e.target)) handleClose()
        }
        if (showForm) {
            document.addEventListener("keydown", handleKeyDown)
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            document.removeEventListener("mousedown", handleClickOutside)
        }
        // eslint-disable-next-line
    }, [showForm])

    // Efecto para precargar datos y decidir el paso inicial
    useEffect(() => {
        console.log("USER CARECHIMBA: ", user)
        if (open) {
            setShowForm(true)
            setErrors({})
            setSubmitError("")

            if (isAuthenticated && user) {
                const userData = {
                    nombreCompleto: user.nombreCompleto || user.nombre || "",
                    documentoIdentidad: user.documentoIdentidad || user.cedula || "",
                    telefono: user.telefono || "",
                    email: user.correoElectronico || user.email || "",
                    // 👇 Asumimos que el cliente puede tener una dirección guardada
                    direccion_envio: user.direccion || "",
                }
                setForm(userData)

                // 👇 ¡LA LÓGICA CLAVE!
                // Si todos los campos necesarios (incluida la dirección) ya están,
                // saltamos directamente al paso de confirmación.
                if (
                    userData.nombreCompleto &&
                    userData.documentoIdentidad &&
                    userData.telefono &&
                    userData.email &&
                    userData.direccion_envio
                ) {
                    setCurrentStep(2)
                } else {
                    setCurrentStep(1)
                }
            } else {
                // Si no está autenticado (aunque no debería llegar aquí con la lógica actual),
                // reseteamos el formulario y empezamos en el paso 1.
                setForm({
                    nombreCompleto: "",
                    documentoIdentidad: "",
                    direccion_envio: "",
                    telefono: "",
                    email: "",
                })
                setCurrentStep(1)
            }
        } else {
            setShowForm(false)
        }
    }, [open, isAuthenticated, user])

    useEffect(() => {
        setShowForm(open)
        setErrors({})
        setSubmitError("")
        setCurrentStep(1)
    }, [open])

    if (!showForm || state.items.length === 0) return null

    // Validación simple
    const validate = () => {
        const errs = {}
        if (!form.nombreCompleto.trim()) errs.nombreCompleto = "El nombre es obligatorio"
        if (!form.documentoIdentidad.trim()) errs.documentoIdentidad = "El documento es obligatorio"
        if (!form.direccion_envio.trim()) errs.direccion_envio = "La dirección es obligatoria"
        if (!form.telefono.trim()) errs.telefono = "El teléfono es obligatorio"
        else if (!/^\d{10}$/.test(form.telefono)) errs.telefono = "Debe tener 10 dígitos"
        if (!form.email.trim()) errs.email = "El correo es obligatorio"
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Correo inválido"
        return errs
    }

    // Formatear moneda
    const formatearPesosColombianos = (valor) =>
        valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")

    // Calcular total
    const calcularTotal = () =>
        state.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

    // Enviar pedido
    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        setErrors(errs)
        if (Object.keys(errs).length > 0) return

        setIsSubmitting(true)
        setSubmitError("")
        try {
            const pedidoData = {
                direccion_envio: form.direccion_envio,
                id_cliente: user.id,
                productos: state.items.map((item) => ({
                    id_producto: item.id,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio,
                })),
                total: calcularTotal(),
            }
            const respuesta = await createPedido(pedidoData)
            toast.success("¡Pedido realizado exitosamente!")
            dispatch({ type: "REMOVE_ALL" })
            setShowForm(false)
            if (onPedidoGuardado) onPedidoGuardado(respuesta)
            onClose && onClose()
        } catch (error) {
            const msg = error.message || "Error al realizar el pedido"
            setSubmitError(msg)
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setShowForm(false)
        onClose && onClose()
    }

    const handleNextStep = () => {
        const errs = validate()
        setErrors(errs)
        if (Object.keys(errs).length === 0) {
            setCurrentStep(2)
        }
    }

    const totalItems = state.items.reduce((acc, item) => acc + item.cantidad, 0)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                ref={modalRef}
                className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[95vh] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                            <ShoppingBag className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Finalizar compra</h2>
                            <p className="text-slate-600">
                                {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'} • ${formatearPesosColombianos(calcularTotal())}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-xl hover:bg-white/80 transition-colors"
                        title="Cerrar"
                    >
                        <X className="w-6 h-6 text-slate-600" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center justify-center space-x-8">
                        <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                                }`}>
                                {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                            </div>
                            <span className="font-medium">Información personal</span>
                        </div>
                        <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                        <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                                }`}>
                                2
                            </div>
                            <span className="font-medium">Confirmación</span>
                        </div>
                    </div>
                </div>

                {/* Contenido scrollable */}
                <div className="flex-1 overflow-y-auto px-0" style={{ minHeight: 0 }}>
                    {/* Step 1: Form */}
                    {currentStep === 1 && (
                        <div className="p-6">
                            {submitError && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-red-800 font-medium">Error al procesar el pedido</h4>
                                        <p className="text-red-700 text-sm mt-1">{submitError}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Nombre completo */}
                                    <div>
                                        <label className="block text-slate-700 font-medium mb-2 flex items-center space-x-2">
                                            <User className="w-4 h-4 text-slate-500" />
                                            <span>Nombre completo</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`text-black w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.nombreCompleto
                                                ? "border-red-300 bg-red-50"
                                                : "border-slate-300 hover:border-slate-400"
                                                }`}
                                            value={form.nombreCompleto}
                                            onChange={e => setForm({ ...form, nombreCompleto: e.target.value })}
                                            placeholder="Ingresa tu nombre completo"
                                            readOnly
                                            autoComplete="name"
                                        />
                                        {errors.nombreCompleto && (
                                            <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>{errors.nombreCompleto}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Documento */}
                                    <div>
                                        <label className="block text-slate-700 font-medium mb-2 flex items-center space-x-2">
                                            <CreditCard className="w-4 h-4 text-slate-500" />
                                            <span>Documento de identidad</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`text-black w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.documentoIdentidad
                                                ? "border-red-300 bg-red-50"
                                                : "border-slate-300 hover:border-slate-400"
                                                }`}
                                            value={form.documentoIdentidad}
                                            onChange={e => setForm({ ...form, documentoIdentidad: e.target.value })}
                                            placeholder="Número de documento"
                                            readOnly
                                            autoComplete="off"
                                        />
                                        {errors.documentoIdentidad && (
                                            <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>{errors.documentoIdentidad}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Teléfono */}
                                    <div>
                                        <label className="block text-slate-700 font-medium mb-2 flex items-center space-x-2">
                                            <Phone className="w-4 h-4 text-slate-500" />
                                            <span>Teléfono</span>
                                        </label>
                                        <input
                                            type="tel"
                                            className={`text-black w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.telefono
                                                ? "border-red-300 bg-red-50"
                                                : "border-slate-300 hover:border-slate-400"
                                                }`}
                                            value={form.telefono}
                                            onChange={e => setForm({ ...form, telefono: e.target.value })}
                                            placeholder="3001234567"
                                            autoComplete="tel"
                                            readOnly
                                            maxLength={10}
                                        />
                                        {errors.telefono && (
                                            <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>{errors.telefono}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-slate-700 font-medium mb-2 flex items-center space-x-2">
                                            <Mail className="w-4 h-4 text-slate-500" />
                                            <span>Correo electrónico</span>
                                        </label>
                                        <input
                                            type="email"
                                            className={`text-black w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.email
                                                ? "border-red-300 bg-red-50"
                                                : "border-slate-300 hover:border-slate-400"
                                                }`}
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            placeholder="cliente@email.com"
                                            autoComplete="email"
                                            readOnly
                                        />
                                        {errors.email && (
                                            <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>{errors.email}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Dirección */}
                                <div>
                                    <label className="block text-slate-700 font-medium mb-2 flex items-center space-x-2">
                                        <MapPin className="w-4 h-4 text-slate-500" />
                                        <span>Dirección de envío</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`text-black w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.direccion_envio
                                            ? "border-red-300 bg-red-50"
                                            : "border-slate-300 hover:border-slate-400"
                                            }`}
                                        value={form.direccion_envio}
                                        onChange={e => setForm({ ...form, direccion_envio: e.target.value })}
                                        placeholder="Dirección completa de envío"
                                        autoComplete="street-address"
                                    />
                                    {errors.direccion_envio && (
                                        <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{errors.direccion_envio}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Confirmation */}
                    {currentStep === 2 && (
                        <div className="p-6 space-y-6">
                            {/* Información del cliente */}
                            <div className="bg-slate-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                                    <User className="w-5 h-5 text-indigo-600" />
                                    <span>Información de entrega</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">Nombre:</span>
                                        <p className="font-medium text-slate-900">{form.nombreCompleto}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Documento:</span>
                                        <p className="font-medium text-slate-900">{form.documentoIdentidad}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Teléfono:</span>
                                        <p className="font-medium text-slate-900">{form.telefono}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Email:</span>
                                        <p className="font-medium text-slate-900">{form.email}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="text-slate-500">Dirección:</span>
                                        {/* 👇 Asegúrate de que el campo del formulario se llame direccion_envio */}
                                        <p className="font-medium text-slate-900">{form.direccion_envio}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                >
                                    Editar información
                                </button>
                            </div>

                            {/* Resumen de productos */}
                            <div className="bg-white border border-slate-200 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                                    <Package className="w-5 h-5 text-indigo-600" />
                                    <span>Resumen de compra</span>
                                </h3>
                                <div className="space-y-3 mb-4">
                                    {state.items.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                                                    {item.imagen ? (
                                                        <img src={item.imagen} alt={item.nombre} className="w-10 h-10 object-cover rounded-lg" />
                                                    ) : (
                                                        <span className="text-indigo-600 font-bold">{item.nombre[0]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{item.nombre}</p>
                                                    <p className="text-sm text-slate-500">Cantidad: {item.cantidad}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-slate-900">${formatearPesosColombianos(item.precio * item.cantidad)}</p>
                                                <p className="text-sm text-slate-500">${formatearPesosColombianos(item.precio)} c/u</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-slate-200 pt-4">
                                    <div className="flex justify-between items-center text-lg">
                                        <span className="font-semibold text-slate-900">Total a pagar</span>
                                        <span className="font-bold text-2xl text-indigo-600">${formatearPesosColombianos(calcularTotal())}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">Envío gratuito incluido</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer SIEMPRE visible */}
                <div className="border-t border-slate-200 p-6 bg-slate-50">
                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={currentStep === 1 ? handleClose : () => setCurrentStep(1)}
                            className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
                            disabled={isSubmitting}
                        >
                            {currentStep === 1 ? 'Cancelar' : 'Volver'}
                        </button>

                        {currentStep === 1 ? (
                            <button
                                onClick={handleNextStep}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
                            >
                                Continuar
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Procesando...</span>
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        <span>Realizar pedido</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}