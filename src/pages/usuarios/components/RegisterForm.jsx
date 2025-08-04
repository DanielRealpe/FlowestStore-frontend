import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { registerCliente, loginCliente } from "../../clientes/api/clienteService"
import { Home as HomeIcon, User, Mail, Lock, Phone, MapPin, AlertCircle, LogIn, IdCard, Eye, EyeOff } from "lucide-react"

const initialForm = {
    nombreCompleto: "",
    tipoDocumento: "cc",
    documentoIdentidad: "",
    correoElectronico: "",
    telefono: "",
    direccion: "",
    password: "",
    confirmPassword: "",
}

const validate = (form) => {
    const errors = {}
    if (!form.nombreCompleto.trim()) {
        errors.nombreCompleto = "El nombre es obligatorio"
    } else if (form.nombreCompleto.length < 3) {
        errors.nombreCompleto = "Debe tener al menos 3 caracteres"
    } else if (form.nombreCompleto.length > 100) {
        errors.nombreCompleto = "Debe tener máximo 100 caracteres"
    }

    if (!form.tipoDocumento) {
        errors.tipoDocumento = "El tipo de documento es obligatorio"
    } else if (!["cc", "tarjeta identidad", "passport"].includes(form.tipoDocumento)) {
        errors.tipoDocumento = "Tipo de documento inválido"
    }

    if (!form.documentoIdentidad.trim()) {
        errors.documentoIdentidad = "El documento es obligatorio"
    } else if (form.documentoIdentidad.length < 6) {
        errors.documentoIdentidad = "Debe tener al menos 6 caracteres"
    } else if (form.documentoIdentidad.length > 10) {
        errors.documentoIdentidad = "Debe tener máximo 10 caracteres"
    }

    if (!form.correoElectronico.trim()) {
        errors.correoElectronico = "El correo es obligatorio"
    } else if (!/\S+@\S+\.\S+/.test(form.correoElectronico)) {
        errors.correoElectronico = "El correo no es válido"
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org)$/i.test(form.correoElectronico)) {
        errors.correoElectronico = "El correo debe terminar en .com, .net o .org"
    }

    if (!form.password.trim()) {
        errors.password = "La contraseña es obligatoria"
    } else if (form.password.length < 6) {
        errors.password = "Debe tener al menos 6 caracteres"
    }

    if (!form.confirmPassword.trim()) {
        errors.confirmPassword = "Confirma tu contraseña"
    } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden"
    }

    if (!form.telefono.trim()) {
        errors.telefono = "El teléfono es obligatorio"
    } else if (!/^\d{10}$/.test(form.telefono)) {
        errors.telefono = "Debe tener exactamente 10 dígitos"
    }

    if (!form.direccion.trim()) {
        errors.direccion = "La dirección es obligatoria"
    } else if (form.direccion.length < 5) {
        errors.direccion = "Debe tener al menos 5 caracteres"
    } else if (form.direccion.length > 200) {
        errors.direccion = "Debe tener máximo 200 caracteres"
    }

    return errors
}

const RegisterForm = () => {
    const [form, setForm] = useState(initialForm)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [formErrors, setFormErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setFormErrors({ ...formErrors, [e.target.name]: "" })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        const errors = validate(form)
        setFormErrors(errors)
        if (Object.keys(errors).length > 0) return

        setLoading(true)
        try {
            await registerCliente(form)
            setSuccess("¡Registro exitoso! Iniciando sesión...")
            await loginCliente({
                correoElectronico: form.correoElectronico,
                password: form.password,
            })
            localStorage.setItem("tipo", "cliente")
            setTimeout(() => {
                navigate("/")
            }, 1200)
        } catch (err) {
            setError(err.message || "Error al registrar")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 to-blue-800 px-2 py-8">
            <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8 animate-fade-in">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-white mb-1">Crear cuenta</h2>
                    <p className="text-gray-400">Regístrate para comprar en <span className="text-blue-400 font-bold">Flowest Store</span></p>
                </div>
                {error && (
                    <div className="bg-red-900 text-white p-3 rounded-lg mb-6 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-900 text-white p-3 rounded-lg mb-6 flex items-center">
                        <HomeIcon className="h-5 w-5 mr-2" />
                        {success}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Primera columna */}
                        <div className="flex flex-col gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 text-blue-400" size={18} />
                                    <input
                                        type="text"
                                        name="nombreCompleto"
                                        value={form.nombreCompleto}
                                        onChange={handleChange}
                                        required
                                        className={`bg-gray-800 text-white pl-10 w-full p-2 rounded-lg border ${formErrors.nombreCompleto ? "border-red-500" : "border-gray-700"} focus:border-blue-500 focus:outline-none`}
                                        placeholder="Nombre completo"
                                        autoComplete="name"
                                    />
                                </div>
                                {formErrors.nombreCompleto && <span className="text-red-400 text-xs">{formErrors.nombreCompleto}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Tipo de documento</label>
                                <div className="relative">
                                    <IdCard className="absolute left-3 top-2.5 text-blue-400" size={18} />
                                    <select
                                        name="tipoDocumento"
                                        value={form.tipoDocumento}
                                        onChange={handleChange}
                                        required
                                        className={`bg-gray-800 text-white pl-10 w-full p-2 rounded-lg border ${formErrors.tipoDocumento ? "border-red-500" : "border-gray-700"} focus:border-blue-500 focus:outline-none appearance-none`}
                                    >
                                        <option value="cc">Cédula de Ciudadanía</option>
                                        <option value="tarjeta identidad">Tarjeta de Identidad</option>
                                        <option value="passport">Pasaporte</option>
                                    </select>
                                </div>
                                {formErrors.tipoDocumento && <span className="text-red-400 text-xs">{formErrors.tipoDocumento}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Documento</label>
                                <div className="relative">
                                    <IdCard className="absolute left-3 top-2.5 text-blue-400" size={18} />
                                    <input
                                        type="text"
                                        name="documentoIdentidad"
                                        value={form.documentoIdentidad}
                                        onChange={handleChange}
                                        required
                                        maxLength={10}
                                        className={`bg-gray-800 text-white pl-10 w-full p-2 rounded-lg border ${formErrors.documentoIdentidad ? "border-red-500" : "border-gray-700"} focus:border-blue-500 focus:outline-none`}
                                        placeholder="Número de documento"
                                        autoComplete="off"
                                    />
                                </div>
                                {formErrors.documentoIdentidad && <span className="text-red-400 text-xs">{formErrors.documentoIdentidad}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Correo electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 text-blue-400" size={18} />
                                    <input
                                        type="email"
                                        name="correoElectronico"
                                        value={form.correoElectronico}
                                        onChange={handleChange}
                                        required
                                        className={`bg-gray-800 text-white pl-10 w-full p-2 rounded-lg border ${formErrors.correoElectronico ? "border-red-500" : "border-gray-700"} focus:border-blue-500 focus:outline-none`}
                                        placeholder="cliente@email.com"
                                        autoComplete="email"
                                    />
                                </div>
                                {formErrors.correoElectronico && <span className="text-red-400 text-xs">{formErrors.correoElectronico}</span>}
                            </div>
                        </div>
                        {/* Segunda columna */}
                        <div className="flex flex-col gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 text-blue-400" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        className={`bg-gray-800 text-white pl-10 pr-10 w-full p-2 rounded-lg border ${formErrors.password ? "border-red-500" : "border-gray-700"} focus:border-blue-500 focus:outline-none`}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        className="absolute right-3 top-2.5 text-blue-400 hover:text-blue-300"
                                        onClick={() => setShowPassword(prev => !prev)}
                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {formErrors.password && <span className="text-red-400 text-xs">{formErrors.password}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 text-blue-400" size={18} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        className={`bg-gray-800 text-white pl-10 pr-10 w-full p-2 rounded-lg border ${formErrors.confirmPassword ? "border-red-500" : "border-gray-700"} focus:border-blue-500 focus:outline-none`}
                                        placeholder="Repite tu contraseña"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        className="absolute right-3 top-2.5 text-blue-400 hover:text-blue-300"
                                        onClick={() => setShowConfirmPassword(prev => !prev)}
                                        aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {formErrors.confirmPassword && <span className="text-red-400 text-xs">{formErrors.confirmPassword}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 text-blue-400" size={18} />
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={form.telefono}
                                        onChange={handleChange}
                                        required
                                        pattern="[0-9]{10}"
                                        maxLength={10}
                                        className={`bg-gray-800 text-white pl-10 w-full p-2 rounded-lg border ${formErrors.telefono ? "border-red-500" : "border-gray-700"} focus:border-blue-500 focus:outline-none`}
                                        placeholder="Ej: 3001234567"
                                        autoComplete="tel"
                                    />
                                </div>
                                {formErrors.telefono && <span className="text-red-400 text-xs">{formErrors.telefono}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Dirección</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 text-blue-400" size={18} />
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={form.direccion}
                                        onChange={handleChange}
                                        required
                                        className={`bg-gray-800 text-white pl-10 w-full p-2 rounded-lg border ${formErrors.direccion ? "border-red-500" : "border-gray-700"} focus:border-blue-500 focus:outline-none`}
                                        placeholder="Dirección de residencia"
                                        autoComplete="street-address"
                                    />
                                </div>
                                {formErrors.direccion && <span className="text-red-400 text-xs">{formErrors.direccion}</span>}
                            </div>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-8 flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? "Registrando..." : "Registrarme"}
                    </button>
                </form>
                {/* Botón para volver al login */}
                <div className="mt-4 flex justify-center">
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-800 text-gray-100 hover:bg-blue-700 transition text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Volver al login"
                    >
                        <LogIn className="h-5 w-5" />
                        ¿Ya tienes cuenta? Inicia sesión
                    </button>
                </div>
                {/* Botón para volver a Home */}
                <div className="mt-6 flex justify-center">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Volver a inicio"
                    >
                        <HomeIcon className="h-5 w-5" />
                        Volver a inicio
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RegisterForm