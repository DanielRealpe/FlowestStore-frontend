import { useAuth } from "../usuarios/context/AuthContext"
import { Heart } from "lucide-react"

const Welcome = () => {
  const { user, signout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center mb-6">
          <Heart className="text-orange-500 w-12 h-12" />
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center mb-4">
          ¡Bienvenido a Flowest Store, {user?.nombre || "Usuario"}!
        </h1>
        
        <div className="text-gray-300 space-y-4">
          <p className="text-center">
            Gracias por ser parte de nuestra plataforma.
          </p>
          
          <div className="bg-gray-700/50 rounded-lg p-4 mt-4">
            <p className="text-center text-sm">
              Si necesitas ayuda o encuentras algún problema, no dudes en contactarnos:
              <br />
              <a href="mailto:soporte@floweststore.com" className="text-orange-400 hover:text-orange-300">
                soporte@floweststore.com
              </a>
            </p>
          </div>
        </div>

        <button
          onClick={signout}
          className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Cerrar Sesión
        </button>

        <p className="text-sm text-gray-400 text-center mt-4">
          Nombre de usuario: {user?.nombre || "No disponible"}
        </p>
      </div>
    </div>
  )
}

export default Welcome