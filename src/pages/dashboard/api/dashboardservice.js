import axios from "axios"

// URL base (ajústala si cambias el puerto)
const VITE_API_URL = "http://localhost:3000/api"

// Instancia de axios centralizada
const apiClient = axios.create({
  baseURL: VITE_API_URL + "/dashboard",
  timeout: 8000,
})

//  Cache en memoria
const cache = new Map()
const CACHE_DURATION = 30000

const getFromCache = (key) => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() })
}

//  Funciones de consumo

export const obtenerResumenDashboard = async (useCache = true, params = {}) => {
  const cacheKey = `resumen_dashboard_${JSON.stringify(params)}`
  if (useCache) {
    const cached = getFromCache(cacheKey)
    if (cached) return cached
  }

  const res = await apiClient.get("/resumen", { params })
  const data = res.data?.data || {}
  setCache(cacheKey, data)
  return data
}

export const obtenerEstadisticasSemanal = async (params = {}) => {
  const res = await apiClient.get("/estadisticas/semanal", { params })
  return res.data?.data || []
}

export const obtenerMetodosPagoHoy = async (params = {}) => {
  const res = await apiClient.get("/metodos-pago/hoy", { params })
  return (
    res.data?.data || {
      efectivo: { cantidad: 0, monto: 0, porcentaje: 0 },
      transferencia: { cantidad: 0, monto: 0, porcentaje: 0 },
      total: { cantidad: 0, monto: 0 },
    }
  )
}

export const obtenerVentasEnTiempoReal = async (params = {}) => {
  const res = await apiClient.get("/ventas/tiempo-real", { params })
  return res.data?.data || []
}

export const obtenerVentasSemanales = async (params = {}) => {
  const res = await apiClient.get("/ventas/semanales", { params })
  return res.data?.data || []
}

// Limpiar cache manual
export const limpiarCacheDashboard = () => {
  cache.clear()
  console.log("🧹 Cache del dashboard limpiada")
}

// Diagnóstico rápido
export const debugDashboardEndpoints = async () => {
  const endpoints = [
    "/resumen",
    "/estadisticas/semanal",
    "/metodos-pago/hoy",
    "/ventas/tiempo-real",
    "/ventas/semanales",
  ]

  for (const endpoint of endpoints) {
    try {
      const res = await apiClient.get(endpoint)
      console.log(`✅ ${endpoint}: ${res.status}`)
    } catch (e) {
      console.error(`❌ ${endpoint}: ${e.message}`)
    }
  }
}
