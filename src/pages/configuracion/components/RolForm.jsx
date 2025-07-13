"use client"

// Primero, modifica el useEffect inicial para cargar y mapear todos los permisos disponibles
import { useState, useEffect } from "react"
import { crearRol, actualizarRol } from "../api/rol"
import { obtenerPermisosPorRol, obtenerPermisos } from "../api/permiso"
import { Shield, Save, X, AlertTriangle } from "lucide-react"
import AlertMessage from "./AlertMessage"

const RolForm = ({ onRolCreado, rolEditar, onCancel }) => {
  const [nombre, setNombre] = useState("")
  const [permisos, setPermisos] = useState({})
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState("")
  const [modo, setModo] = useState("crear")
  const [todosLosPermisos, setTodosLosPermisos] = useState([]) // Lista completa de permisos del sistema

  // Cargar datos si estamos editando
  useEffect(() => {
    const cargarFormulario = async () => {
      try {
        const { permisos: permisosDisponibles } = await obtenerPermisos()
        setTodosLosPermisos(permisosDisponibles)

        // Inicializar estructura base
        const permisosMap = {}
        permisosDisponibles.forEach((permiso) => {
          if (!permisosMap[permiso.recurso]) {
            permisosMap[permiso.recurso] = {}
          }
          permisosMap[permiso.recurso][permiso.accion] = false
        })

        // Si estamos en modo edición, aplicar los permisos actuales
        if (rolEditar) {
          setNombre(rolEditar.nombre)
          setModo("editar")

          const response = await obtenerPermisosPorRol(rolEditar.id)
          const permisosExistentes = response.permisos || []

          permisosExistentes.forEach((permiso) => {
            if (permisosMap[permiso.recurso]) {
              permisosMap[permiso.recurso][permiso.accion] = permiso.activo
            }
          })
        } else {
          setModo("crear")
          setNombre("")
        }

        setPermisos(permisosMap)
      } catch (err) {
        console.error("Error al cargar datos del formulario:", err)
        setError(`Error al cargar datos del formulario: ${err.message}`)
      }
    }

    cargarFormulario()
  }, [rolEditar])

  const handleCheckboxChange = (modulo, accion) => {
    setPermisos({
      ...permisos,
      [modulo]: {
        ...permisos[modulo],
        [accion]: !permisos[modulo][accion],
      },
    })
  }

  // Seleccionar todos los permisos de un módulo
  const selectAllForModule = (modulo) => {
    setPermisos({
      ...permisos,
      [modulo]: {
        crear: true,
        editar: true,
      },
    })
  }

  // Deseleccionar todos los permisos de un módulo
  const deselectAllForModule = (modulo) => {
    setPermisos({
      ...permisos,
      [modulo]: {
        crear: false,
        editar: false,
      },
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) {
      setError("Debes ingresar un nombre para el rol")
      return
    }

    setCargando(true)
    setError("")

    try {
      // Recolectar IDs de permisos seleccionados
      const permisosSeleccionados = []

      // Iterar por los permisos seleccionados por el usuario
      for (const modulo in permisos) {
        for (const accion in permisos[modulo]) {
          if (permisos[modulo][accion]) {
            // Buscar el ID del permiso en la lista completa de permisos
            const permisoEncontrado = todosLosPermisos.find((p) => p.recurso === modulo && p.accion === accion)

            if (permisoEncontrado) {
              permisosSeleccionados.push(permisoEncontrado.id)
            } else {
              console.warn(`No se encontró el permiso para ${modulo}.${accion}`)
            }
          }
        }
      }

      console.log("Permisos seleccionados para enviar:", permisosSeleccionados)

      let rolResultado
      if (modo === "crear") {
        // Crear rol con los IDs de permisos seleccionados
        rolResultado = await crearRol({
          nombre,
          permisos: permisosSeleccionados,
        })
      } else if (modo === "editar") {
        // Actualizar rol con los IDs de permisos seleccionados
        rolResultado = await actualizarRol(rolEditar.id, {
          nombre,
          permisos: permisosSeleccionados,
        })
      }

      // Notificar al componente padre
      if (onRolCreado) {
        onRolCreado(rolResultado)
      }
    } catch (err) {
      setError(`Error al ${modo === "crear" ? "crear" : "actualizar"} el rol: ${err.message}`)
    } finally {
      setCargando(false)
    }
  }

  // Verificar si hay al menos un permiso seleccionado
  const hayPermisosSeleccionados = Object.values(permisos).some((modulo) =>
    Object.values(modulo).some((valor) => valor),
  )

  return (
    <div className="space-y-6">
      {error && <AlertMessage type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-orange-400 mb-2 font-medium" htmlFor="nombre">
            Nombre del Rol
          </label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full bg-gray-800 border border-orange-500/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            placeholder="Ej: Administrador, Vendedor, etc."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-orange-400 font-medium flex items-center">
              <Shield className="mr-2" size={18} />
              Permisos por Módulo
            </h3>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  const allModules = { ...permisos }
                  Object.keys(allModules).forEach((modulo) => {
                    allModules[modulo] = { crear: true, editar: true }
                  })
                  setPermisos(allModules)
                }}
                className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
              >
                Seleccionar Todos
              </button>
              <button
                type="button"
                onClick={() => {
                  const allModules = { ...permisos }
                  Object.keys(allModules).forEach((modulo) => {
                    allModules[modulo] = { crear: false, editar: false }
                  })
                  setPermisos(allModules)
                }}
                className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
              >
                Deseleccionar Todos
              </button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full text-white">
              <thead>
                <tr className="bg-gray-900/80">
                  <th className="text-left p-3 font-medium text-orange-300">Módulo</th>
                  <th className="text-center p-3 font-medium text-green-400">Crear</th>
                  <th className="text-center p-3 font-medium text-yellow-400">Editar</th>
                  <th className="text-center p-3 font-medium text-orange-300 w-24">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(permisos).map(([modulo, acciones], index) => {
                  const allSelected = acciones.crear && acciones.editar
                  const noneSelected = !acciones.crear && !acciones.editar

                  return (
                    <tr
                      key={modulo}
                      className={`border-t border-gray-700 hover:bg-gray-700/30 transition-colors ${
                        index % 2 === 0 ? "bg-gray-800/50" : "bg-gray-800"
                      }`}
                    >
                      <td className="p-3 capitalize font-medium">{modulo}</td>
                      <td className="p-3 text-center">
                        <label className="inline-flex items-center justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={acciones.crear}
                            onChange={() => handleCheckboxChange(modulo, "crear")}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded ${
                              acciones.crear ? "bg-green-500 ring-2 ring-green-300/30" : "bg-gray-700 hover:bg-gray-600"
                            } flex items-center justify-center transition-all duration-200`}
                          >
                            {acciones.crear && <span className="text-white text-xs">✓</span>}
                          </div>
                        </label>
                      </td>
                      <td className="p-3 text-center">
                        <label className="inline-flex items-center justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={acciones.editar}
                            onChange={() => handleCheckboxChange(modulo, "editar")}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded ${
                              acciones.editar
                                ? "bg-yellow-500 ring-2 ring-yellow-300/30"
                                : "bg-gray-700 hover:bg-gray-600"
                            } flex items-center justify-center transition-all duration-200`}
                          >
                            {acciones.editar && <span className="text-white text-xs">✓</span>}
                          </div>
                        </label>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            type="button"
                            onClick={() => selectAllForModule(modulo)}
                            disabled={allSelected}
                            className={`text-xs px-2 py-1 rounded ${
                              allSelected
                                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            }`}
                          >
                            Todo
                          </button>
                          <button
                            type="button"
                            onClick={() => deselectAllForModule(modulo)}
                            disabled={noneSelected}
                            className={`text-xs px-2 py-1 rounded ${
                              noneSelected
                                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            }`}
                          >
                            Nada
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {!hayPermisosSeleccionados && (
            <p className="mt-2 text-yellow-500 text-sm flex items-center">
              <AlertTriangle size={14} className="mr-1" />
              Selecciona al menos un permiso para este rol
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
          >
            <X size={18} className="mr-1" /> Cancelar
          </button>
          <button
            type="submit"
            disabled={cargando || !nombre.trim() || !hayPermisosSeleccionados}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-5 rounded-lg transition duration-200 flex items-center disabled:opacity-50 disabled:pointer-events-none"
          >
            {cargando ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Guardando...
              </span>
            ) : (
              <>
                <Save size={18} className="mr-1" /> {modo === "crear" ? "Guardar Rol" : "Actualizar Rol"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default RolForm
