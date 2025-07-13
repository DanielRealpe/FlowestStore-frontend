"use client"

import type React from "react"

import { useState } from "react"
import { User, Mail, CreditCard, Shield, Edit, Save, X } from "lucide-react"

interface UserProfileProps {
  user?: {
    id?: number
    nombre?: string
    email?: string
    cedula?: string
    estado?: "activo" | "inactivo"
    id_rol?: number
    rol?: {
      id: number
      nombre: string
    }
  }
  onUpdateProfile?: (userData: any) => Promise<void>
}

const UserProfile = ({ user, onUpdateProfile }: UserProfileProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nombre: user?.nombre || "",
    email: user?.email || "",
    cedula: user?.cedula || "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    if (!onUpdateProfile) return

    setIsLoading(true)
    try {
      await onUpdateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      nombre: user?.nombre || "",
      email: user?.email || "",
      cedula: user?.cedula || "",
    })
    setIsEditing(false)
  }

  const getRoleName = () => {
    if (user?.rol?.nombre) return user.rol.nombre
    if (user?.id_rol === 1) return "Administrador"
    if (user?.id_rol === 2) return "Usuario"
    return "Sin rol asignado"
  }

  const getStatusBadge = () => {
    const isActive = user?.estado === "activo"
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {isActive ? "Activo" : "Inactivo"}
      </span>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.nombre || "Usuario"}</h1>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge()}
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{getRoleName()}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Edit size={16} className="mr-2" />
            {isEditing ? "Cancelar" : "Editar Perfil"}
          </button>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Información Personal</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              Nombre Completo
            </label>
            {isEditing ? (
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ingrese su nombre completo"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{user?.nombre || "No especificado"}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail size={16} className="inline mr-2" />
              Correo Electrónico
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ingrese su correo electrónico"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{user?.email || "No especificado"}</p>
            )}
          </div>

          {/* Cédula */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard size={16} className="inline mr-2" />
              Cédula de Identidad
            </label>
            {isEditing ? (
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ingrese su cédula"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{user?.cedula || "No especificado"}</p>
            )}
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield size={16} className="inline mr-2" />
              Rol en el Sistema
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{getRoleName()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X size={16} className="mr-2" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              <Save size={16} className="mr-2" />
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        )}
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Seguridad</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Cambiar Contraseña</h3>
              <p className="text-sm text-gray-600">Actualiza tu contraseña para mantener tu cuenta segura</p>
            </div>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Cambiar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
