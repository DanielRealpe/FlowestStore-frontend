"use client"

import { useEffect, useState } from "react"
import { Home as HomeIcon, Mail, Lock, AlertCircle } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import RecuperarPasswordModal from "../modals/RecuperarPasswordModal"
import { useNavigate } from "react-router-dom"
import { loginCliente } from "../../clientes/api/clienteService"

const LoginForm = () => {
  const { signin, loading, errors } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showRecuperarModal, setShowRecuperarModal] = useState(false)
  const [localError, setLocalError] = useState("")
  const navigate = useNavigate()

  // Limpiar errores al montar el formulario
  useEffect(() => {
    setLocalError("")
    // Si tienes un método para limpiar errores globales, agrégalo aquí
    // Por ejemplo: clearErrors && clearErrors()
    // Si errors es un estado, podrías hacer: setErrors && setErrors([])
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setLocalError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError("")
    try {
      // Intentar login como usuario (admin)
      const user = await signin(formData)
      if (user && user.rol) {
        localStorage.setItem("tipo", "usuario")
        navigate("/dashboard")
        return
      }
    } catch (err) {
      // Si falla, intenta login como cliente
      try {
        const cliente = await loginCliente({
          correoElectronico: formData.email,
          password: formData.password,
        })
        if (cliente) {
          localStorage.setItem("tipo", "cliente")
          navigate("/")
          return
        } else {
          setLocalError("Correo o contraseña incorrectos")
        }
      } catch (err2) {
        setLocalError("Correo o contraseña incorrectos")
      }
    }
  }

  return (
    <div className="max-w-md mx-auto bg-gray-900 rounded-xl shadow-md overflow-hidden md:max-w-2xl border border-gray-800 mt-10">
      <div className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Iniciar Sesión</h2>
          <p className="text-gray-400">Ingresa tus credenciales para acceder</p>
        </div>

        {(errors && errors.length > 0) && (
          <div className="bg-red-900 text-white p-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {errors[0]}
          </div>
        )}
        {localError && (
          <div className="bg-red-900 text-white p-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-gray-800 text-white pl-10 w-full p-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-gray-800 text-white pl-10 w-full p-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-800"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                Recordarme
              </label>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setShowRecuperarModal(true)}
                className="text-sm text-blue-500 hover:text-blue-400 focus:outline-none"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </div>
        </form>

        {/* Botón para registrarse */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-800 text-gray-100 hover:bg-blue-700 transition text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Registrarse"
          >
            ¿No tienes cuenta? Regístrate
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

      {/* Modal de recuperación de contraseña */}
      {showRecuperarModal && <RecuperarPasswordModal onClose={() => setShowRecuperarModal(false)} />}
    </div>
  )
}

export default LoginForm
