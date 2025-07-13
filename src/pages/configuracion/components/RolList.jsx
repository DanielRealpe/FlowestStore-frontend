"use client"

import React, { useState, useEffect } from "react"
import { obtenerRoles, eliminarRol } from "../api/rol"
import { obtenerPermisosPorRol } from "../api/permiso"
import { Edit, Trash, Eye, EyeOff, Check, X, Shield } from "lucide-react"
import AlertMessage from "../components/AlertMessage"

const RolList = ({ onEditRol, refreshTrigger }) => {
  const [roles, setRoles] = useState([])
  const [permisosPorRol, setPermisosPorRol] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")
  const [rolSeleccionado, setRolSeleccionado] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Módulos disponibles para mostrar en la tabla
  const modulos = ["clientes", "productos", "ventas", "pedidos", "categorias"]

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true)
      setError("")

      try {
        // Cargar roles
        const rolesData = await obtenerRoles()
        setRoles(rolesData)

        // Cargar permisos para cada rol
        const permisosTemp = {}
        for (const rol of rolesData) {
          try {
            const permisosRol = await obtenerPermisosPorRol(rol.id)
            permisosTemp[rol.id] = permisosRol
          } catch (permError) {
            console.error(`Error al cargar permisos para rol ${rol.id}:`, permError)
            permisosTemp[rol.id] = []
          }
        }

        setPermisosPorRol(permisosTemp)
      } catch (err) {
        console.error("Error completo:", err)
        setError(`Error al cargar los datos: ${err.message}`)
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()
  }, [refreshTrigger])

  const tienePermiso = (rolId, modulo, accion) => {
    if (!permisosPorRol[rolId]) return false

    // Si permisosPorRol[rolId] es un objeto con propiedad 'permisos'
    const permisosArray = Array.isArray(permisosPorRol[rolId])
      ? permisosPorRol[rolId]
      : permisosPorRol[rolId].permisos || []

    return permisosArray.some((permiso) => permiso.recurso === modulo && permiso.accion === accion && permiso.activo)
  }

  const handleVerPermisos = (rol) => {
    setRolSeleccionado(rolSeleccionado === rol.id ? null : rol.id)
  }

  const handleEliminarRol = async (id) => {
    try {
      await eliminarRol(id)
      // Actualizar la lista
      setRoles(roles.filter((rol) => rol.id !== id))
      setConfirmDelete(null)
    } catch (err) {
      setError(`Error al eliminar el rol: ${err.message}`)
    }
  }

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-orange-400">Cargando roles...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <AlertMessage type="error" message={error} />
        <p className="text-gray-300 text-sm">
          Verifica que el servidor API esté ejecutándose en http://localhost:3000 y que las rutas /api/roles y
          /api/permisos estén disponibles.
        </p>
      </div>
    )
  }

  if (roles.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-8 text-center border border-gray-700">
        <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto flex items-center justify-center mb-4">
          <Shield className="text-gray-400" size={24} />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">No hay roles registrados</h3>
        <p className="text-gray-400 text-sm">Crea un nuevo rol para comenzar a gestionar permisos</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full text-white">
          <thead>
            <tr className="bg-gray-900/80">
              <th className="text-left p-3 font-medium text-orange-300">Nombre</th>
              <th className="text-center p-3 font-medium text-orange-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((rol) => (
              <React.Fragment key={rol.id}>
                <tr className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors">
                  <td className="p-3 font-medium">{rol.nombre}</td>
                  <td className="p-3">
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => handleVerPermisos(rol)}
                        className={`p-1.5 rounded-full transition-all duration-200 ${
                          rolSeleccionado === rol.id
                            ? "bg-blue-500/20 text-blue-400"
                            : "text-blue-400/70 hover:text-blue-400 hover:bg-blue-500/10"
                        }`}
                        title={rolSeleccionado === rol.id ? "Ocultar permisos" : "Ver permisos"}
                      >
                        {rolSeleccionado === rol.id ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() => onEditRol(rol)}
                        className="p-1.5 rounded-full text-yellow-400/70 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all duration-200"
                        title="Editar rol"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(rol.id)}
                        className="p-1.5 rounded-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                        title="Eliminar rol"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>

                {confirmDelete === rol.id && (
                  <tr>
                    <td colSpan="2" className="p-0 border-t border-gray-700">
                      <div className="bg-red-900/20 p-3 flex items-center justify-between">
                        <p className="text-white text-sm">
                          ¿Confirmar eliminación de <span className="font-medium">{rol.nombre}</span>?
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEliminarRol(rol.id)}
                            className="p-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="p-1.5 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all duration-200"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {rolSeleccionado === rol.id && (
                  <tr>
                    <td colSpan="2" className="p-0 border-t border-gray-700">
                      <div className="bg-gray-800/80 p-4">
                        <h4 className="text-orange-400 mb-3 font-medium flex items-center">
                          <Shield className="mr-1" size={16} />
                          Permisos de {rol.nombre}
                        </h4>
                        <div className="bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-700 bg-gray-900/30">
                                <th className="text-left p-2 font-medium text-gray-400">Módulo</th>
                                <th className="text-center p-2 font-medium text-green-400">Crear</th>
                                <th className="text-center p-2 font-medium text-yellow-400">Editar</th>
                              </tr>
                            </thead>
                            <tbody>
                              {modulos.map((modulo, idx) => (
                                <tr
                                  key={modulo}
                                  className={`border-b border-gray-700 ${idx % 2 === 0 ? "bg-gray-900/10" : ""}`}
                                >
                                  <td className="p-2 capitalize">{modulo}</td>
                                  <td className="p-2 text-center">
                                    {tienePermiso(rol.id, modulo, "crear") ? (
                                      <span className="inline-flex items-center justify-center bg-green-500/20 text-green-400 rounded-full w-6 h-6">
                                        <Check size={14} />
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center justify-center bg-gray-700 text-gray-500 rounded-full w-6 h-6">
                                        <X size={14} />
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2 text-center">
                                    {tienePermiso(rol.id, modulo, "editar") ? (
                                      <span className="inline-flex items-center justify-center bg-yellow-500/20 text-yellow-400 rounded-full w-6 h-6">
                                        <Check size={14} />
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center justify-center bg-gray-700 text-gray-500 rounded-full w-6 h-6">
                                        <X size={14} />
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RolList
