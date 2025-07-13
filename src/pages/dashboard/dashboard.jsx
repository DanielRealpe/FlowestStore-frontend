"use client"

// src/dashboard/Dashboard.jsx
import { useEffect, useState } from "react"
import DoughnutChart from "./components/DoughnutsChart"
import {
  obtenerResumenDashboard,
  obtenerEstadisticasSemanal,
  obtenerMetodosPagoHoy,
  obtenerVentasEnTiempoReal,
} from "./api/dashboardservice"
import { getUsuarioAutenticado } from "../usuarios/api/usuarioService" // Asegúrate de ajustar la ruta si es necesaria

const Dashboard = () => {
  const [resumen, setResumen] = useState(null)
  const [estadisticas, setEstadisticas] = useState([])
  const [metodosPago, setMetodosPago] = useState(null)
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)
  const [usuario, setUsuario] = useState(null)

  const cargarDatos = async () => {
    try {
      setCargando(true)

      // Obtener información del usuario autenticado
      const usuarioActual = await getUsuarioAutenticado()
      setUsuario(usuarioActual)

      const esAdmin = usuarioActual?.id_rol === 1

      // Parámetros para filtrar por usuario si no es admin
      const params = !esAdmin ? { id_usuario: usuarioActual?.id } : {}

      // Cargar datos con filtro si es necesario
      const [r, e, m, v] = await Promise.all([
        obtenerResumenDashboard(true, params),
        obtenerEstadisticasSemanal(params),
        obtenerMetodosPagoHoy(params),
        obtenerVentasEnTiempoReal(params),
      ])

      setResumen(r)
      setEstadisticas(e)
      setMetodosPago(m)
      setVentas(v)
    } catch (err) {
      console.error("Error cargando dashboard:", err)
      setError(true)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
    const interval = setInterval(cargarDatos, 5 * 60 * 1000) // 5 minutos
    return () => clearInterval(interval)
  }, [])

  if (cargando) {
    return <div className="text-center text-white p-10">Cargando datos del dashboard...</div>
  }

  if (error) {
    return <div className="text-center text-red-400 p-10">Error cargando el dashboard. Intenta más tarde.</div>
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <h1 className="text-3xl font-bold mb-4">
        📊 Dashboard NextMeal {usuario?.id_rol !== 1 ? "- Mis Ventas" : "- Todas las Ventas"}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded-xl shadow">
          <h2 className="text-sm text-gray-400">Ventas Hoy</h2>
          <p className="text-2xl font-bold">${resumen?.montoVentasHoy.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl shadow">
          <h2 className="text-sm text-gray-400">Ventas Semana</h2>
          <p className="text-2xl font-bold">${resumen?.montoVentasSemana.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl shadow">
          <h2 className="text-sm text-gray-400">Efectivo Hoy</h2>
          <p className="text-2xl">${metodosPago?.efectivo.monto.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl shadow">
          <h2 className="text-sm text-gray-400">Transferencia Hoy</h2>
          <p className="text-2xl">${metodosPago?.transferencia.monto.toLocaleString()}</p>
        </div>
      </div>

      <DoughnutChart estadisticasSemanal={estadisticas} metodosPagoHoy={metodosPago} />

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-2">Ventas recientes</h2>
        {ventas.length > 0 ? (
          <ul className="divide-y divide-gray-700">
            {ventas.map((venta, index) => (
              <li key={index} className="py-2 flex justify-between">
                <span>#{venta.id}</span>
                <span>${venta.total_pagar}</span>
                <span>{new Date(venta.fecha_venta).toLocaleDateString("es-ES")}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No hay ventas registradas hoy.</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
