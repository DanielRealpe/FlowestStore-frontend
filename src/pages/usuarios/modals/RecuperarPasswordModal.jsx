"use client"

import { useState } from "react"
import { Mail, Lock, KeyRound, ArrowLeft, Check, AlertCircle, Loader } from "lucide-react"
import { toast } from "react-toastify"
import { solicitarRecuperacion, verificarCodigo, cambiarPassword } from "../api/recuperacionService"

const RecuperarPasswordModal = ({ onClose }) => {
  const [paso, setPaso] = useState(1)
  const [email, setEmail] = useState("")
  const [codigo, setCodigo] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [usuarioId, setUsuarioId] = useState(null)
  const [codigoId, setCodigoId] = useState(null)

  // Solicitar código de recuperación
  const handleSolicitarCodigo = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw new Error("Por favor ingresa un correo electrónico válido")
      }

      await solicitarRecuperacion(email)
      toast.success("Se ha enviado un código a tu correo electrónico")
      setPaso(2)
    } catch (err) {
      setError(err.message || "Error al solicitar el código de recuperación")
      toast.error(err.message || "Error al solicitar el código de recuperación")
    } finally {
      setLoading(false)
    }
  }

  // Verificar código
  const handleVerificarCodigo = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!codigo || codigo.length !== 6) {
        throw new Error("Por favor ingresa el código de 6 dígitos")
      }

      const resultado = await verificarCodigo(email, codigo)
      setUsuarioId(resultado.usuario_id)
      setCodigoId(resultado.codigo_id)
      toast.success("Código verificado correctamente")
      setPaso(3)
    } catch (err) {
      setError(err.message || "Código inválido o expirado")
      toast.error(err.message || "Código inválido o expirado")
    } finally {
      setLoading(false)
    }
  }

  // Cambiar contraseña
  const handleCambiarPassword = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!password || password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres")
      }

      if (password !== confirmPassword) {
        throw new Error("Las contraseñas no coinciden")
      }

      await cambiarPassword(usuarioId, codigoId, password)
      toast.success("Contraseña actualizada correctamente")
      setPaso(4)
    } catch (err) {
      setError(err.message || "Error al cambiar la contraseña")
      toast.error(err.message || "Error al cambiar la contraseña")
    } finally {
      setLoading(false)
    }
  }

  // Volver al paso anterior
  const volverPaso = () => {
    setError("")
    setPaso((prevPaso) => Math.max(prevPaso - 1, 1))
  }

  // Cerrar modal y volver al login
  const finalizarProceso = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-blue-500 animate-fade-in">
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-950">
          <h2 className="text-lg font-bold text-white flex items-center">
            <span className="bg-blue-500 text-white p-1.5 rounded-lg mr-2">
              <KeyRound size={16} />
            </span>
            Recuperar Contraseña
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:rotate-90 transition-all bg-gray-800 p-1.5 rounded-full"
            title="Cerrar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Indicador de pasos */}
          <div className="flex justify-center mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm
                    ${
                      paso === step
                        ? "bg-blue-500 shadow-lg shadow-blue-500/30"
                        : paso > step
                          ? "bg-green-500 shadow-lg shadow-green-500/30"
                          : "bg-gray-700"
                    }`}
                >
                  {step}
                </div>
                {step < 4 && <div className={`w-12 h-1 ${paso > step ? "bg-green-500" : "bg-gray-700"}`}></div>}
              </div>
            ))}
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-900/50 text-white p-3 rounded-lg mb-4 flex items-center text-sm">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Paso 1: Solicitar código */}
          {paso === 1 && (
            <form onSubmit={handleSolicitarCodigo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800 text-white pl-10 w-full p-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  Ingresa tu correo electrónico para recibir un código de verificación
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Código"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Paso 2: Verificar código */}
          {paso === 2 && (
            <form onSubmit={handleVerificarCodigo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Código de Verificación</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    className="bg-gray-800 text-white pl-10 w-full p-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-center tracking-widest"
                    placeholder="123456"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-gray-400 text-xs mt-2">Ingresa el código de 6 dígitos que enviamos a {email}</p>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={volverPaso}
                  className="flex items-center py-2 px-4 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Verificando...
                    </>
                  ) : (
                    "Verificar Código"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Paso 3: Cambiar contraseña */}
          {paso === 3 && (
            <form onSubmit={handleCambiarPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nueva Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800 text-white pl-10 w-full p-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Confirmar Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-800 text-white pl-10 w-full p-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  La contraseña debe tener al menos 6 caracteres y no puede ser igual a la anterior
                </p>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={volverPaso}
                  className="flex items-center py-2 px-4 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Actualizando...
                    </>
                  ) : (
                    "Cambiar Contraseña"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Paso 4: Éxito */}
          {paso === 4 && (
            <div className="text-center py-4">
              <div className="bg-green-900/30 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Check size={40} className="text-green-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">¡Contraseña Actualizada!</h3>
              <p className="text-gray-400 mb-6">
                Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <button
                onClick={finalizarProceso}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Volver al Inicio de Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecuperarPasswordModal
