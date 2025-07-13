"use client"

import { createContext, useState, useEffect, useContext, useRef } from "react"
import { getUsuarioAutenticado, loginUsuario, logoutUsuario, obtenerPermisosUsuario } from "../api/usuarioService"

// 1. Create the context
const AuthContext = createContext(null)

// 2. Create the AuthProvider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [permisos, setPermisos] = useState([])

  // Usar una referencia para evitar múltiples cargas de permisos
  const permisosLoaded = useRef(false)
  const authCheckComplete = useRef(false)

  // Function to navigate without depending on next/navigation
  const navigateTo = (path) => {
    // Evitar redirecciones innecesarias
    if (window.location.pathname !== path) {
      console.log(`Navegando a: ${path} desde: ${window.location.pathname}`)
      window.location.href = path
    } else {
      console.log(`Ya estamos en la ruta: ${path}, evitando redirección`)
    }
  }

  // Load user permissions
  const loadUserPermissions = async () => {
    try {
      // Only try to load permissions if the user is authenticated
      if (!isAuthenticated || !user) {
        console.log("No se cargan permisos porque el usuario no está autenticado")
        return []
      }

      // Evitar cargar permisos múltiples veces
      if (permisosLoaded.current) {
        console.log("Permisos ya cargados, evitando carga duplicada")
        return permisos
      }

      console.log("Cargando permisos para el usuario:", user.id)
      const permisosData = await obtenerPermisosUsuario()
      const permisosArray = permisosData.permisos || []

      console.log("Permisos cargados:", permisosArray, "Fuente:", permisosData.source || "desconocida")

      // Asegurarse de que todos los módulos tengan al menos permiso de "ver"
      // const modulosBasicos = ["no"]
      const permisosCompletos = [...permisosArray]

      // Añadir permisos de "ver" para módulos básicos si no existen
      // modulosBasicos.forEach((modulo) => {
      //   const tienePermisoVer = permisosArray.some(
      //     (p) => (typeof p === "string" && p === modulo) || (p.recurso === modulo && p.accion === "ver"),
      //   )

      //   if (!tienePermisoVer) {
      //     permisosCompletos.push({ recurso: modulo, accion: "ver" })
      //   }
      // })

      setPermisos(permisosCompletos)

      // Marcar que los permisos ya se cargaron
      permisosLoaded.current = true

      // Update user with permissions
      setUser((prev) => {
        if (!prev) return prev
        return { ...prev, permisos: permisosCompletos }
      })

      return permisosCompletos
    } catch (error) {
      console.error("Error al cargar permisos:", error)
      // En caso de error, establecer permisos básicos en lugar de un array vacío
      const permisosBasicos = [
        { recurso: "productos", accion: "ver" },
        { recurso: "categorias", accion: "ver" },
        { recurso: "ventas", accion: "ver" },
        { recurso: "pedidos", accion: "ver" },
        { recurso: "clientes", accion: "ver" },
      ]
      setPermisos(permisosBasicos)

      // Marcar que los permisos ya se cargaron (aunque sean básicos)
      permisosLoaded.current = true

      return permisosBasicos
    }
  }

  // Verify authentication when loading the application
  useEffect(() => {
    const checkAuth = async () => {
      // Evitar verificaciones múltiples
      if (authCheckComplete.current) {
        console.log("Verificación de autenticación ya completada, evitando verificación duplicada")
        return
      }

      try {
        console.log("Iniciando verificación de autenticación")
        // Try to get user from localStorage first for immediate UI
        const storedUser = localStorage.getItem("user")
        const storedToken = localStorage.getItem("token")

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          setIsAuthenticated(true)

          // Try to verify with the server only if there's a token
          try {
            const userData = await getUsuarioAutenticado()
            if (userData) {
              setUser(userData)
              localStorage.setItem("user", JSON.stringify(userData))

              // Load user permissions
              await loadUserPermissions()
            }
          } catch (serverError) {
            console.log("Error al verificar con el servidor, usando datos almacenados:", serverError.message)
            // If server verification fails but we have local data, keep using that
          }

          // Redirect to dashboard if on login and authenticated
          if (window.location.pathname === "/login") {
            navigateTo("/dashboard")
          }
        } else {
          // If no data in localStorage, user is not authenticated
          setUser(null)
          setIsAuthenticated(false)

          // If not on login and not authenticated, redirect to login
          if (!window.location.pathname.includes("/login")) {
            navigateTo("/login")
          }
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
        setUser(null)
        setIsAuthenticated(false)
        localStorage.removeItem("user")
        localStorage.removeItem("token")

        // If not on login and there's an error, redirect to login
        if (!window.location.pathname.includes("/login")) {
          navigateTo("/login")
        }
      } finally {
        setIsLoadingAuth(false)
        // Marcar que la verificación de autenticación ya se completó
        authCheckComplete.current = true
        console.log("Verificación de autenticación completada")
      }
    }

    checkAuth()
  }, [])

  // Function to sign in
  const signin = async (credentials) => {
    setLoading(true)
    setErrors([])
    try {
      // Login and get token and user data
      const response = await loginUsuario(credentials)
      console.log("Respuesta de login:", response)

      if (response.token) {
        localStorage.setItem("token", response.token)
      }

      if (response.usuario) {
        setUser(response.usuario)
        setIsAuthenticated(true)
        localStorage.setItem("user", JSON.stringify(response.usuario))

        // Resetear el estado de carga de permisos
        permisosLoaded.current = false

        // Load user permissions
        await loadUserPermissions()

        navigateTo("/dashboard")
        return response
      } else {
        throw new Error("No se recibieron datos de usuario")
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      setErrors([error.response?.data?.mensaje || "Credenciales incorrectas"])
      setIsAuthenticated(false)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Function to sign out
  const signout = async () => {
    try {
      await logoutUsuario()
      setUser(null)
      setIsAuthenticated(false)
      setPermisos([])
      localStorage.removeItem("user")
      localStorage.removeItem("token")

      // Resetear los estados de referencia
      permisosLoaded.current = false
      authCheckComplete.current = false

      navigateTo("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      // Clean data anyway
      setUser(null)
      setIsAuthenticated(false)
      setPermisos([])
      localStorage.removeItem("user")
      localStorage.removeItem("token")

      // Resetear los estados de referencia
      permisosLoaded.current = false
      authCheckComplete.current = false

      navigateTo("/login")
    }
  }

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!user) return false
    return user.id_rol === role
  }

  // Check if user has a specific permission
  const hasPermission = (recurso, accion) => {
    // Si no hay usuario o permisos, no tiene permiso
    if (!user || !permisos || permisos.length === 0) {
      return false
    }

    // Si es administrador, tiene todos los permisos
    if (user.id_rol === 1) {
      return true
    }

    // Si la acción es "ver", siempre permitir para módulos básicos
    if (accion === "ver") {
      const modulosBasicos = [""]
      if (modulosBasicos.includes(recurso)) {
        return true
      }
    }

    // Verificar en los permisos cargados
    const tienePermiso = permisos.some((p) => {
      // Manejar diferentes formatos de permisos
      if (typeof p === "string") {
        return p === recurso
      }

      // Verificar si coinciden recurso y acción
      const coincideRecurso = p.recurso === recurso
      const coincideAccion = p.accion === accion
      const estaActivo = p.activo !== false // Si no tiene propiedad activo o es true

      return coincideRecurso && coincideAccion && estaActivo
    })

    return tienePermiso
  }

  // Check if user can delete (only admins)
  const canDelete = () => {
    return user && user.id_rol === 1
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        loading,
        errors,
        signin,
        signout,
        hasRole,
        hasPermission,
        canDelete,
        navigateTo,
        loadUserPermissions,
        permisos,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// 3. Create the useAuth hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider")
  return context
}
