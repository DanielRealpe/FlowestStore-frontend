import React, { useMemo } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Registrar componentes de ChartJS
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const DoughnutChart = ({ estadisticasSemanal = [], metodosPagoHoy = {} }) => {

  console.log('🎯 DoughnutChart recibió:', {
    estadisticasSemanal: estadisticasSemanal?.length || 0,
    metodosPagoHoy: metodosPagoHoy,
    efectivoMonto: metodosPagoHoy?.efectivo?.monto,
    transferenciaMonto: metodosPagoHoy?.transferencia?.monto
  });

  // Validar y preparar datos para el gráfico de dona (métodos de pago)
  const efectivoMonto = metodosPagoHoy?.efectivo?.monto || 0;
  const transferenciaMonto = metodosPagoHoy?.transferencia?.monto || 0;
  const totalMetodos = efectivoMonto + transferenciaMonto;

  const datosDonut = useMemo(() => ({
    labels: ['Efectivo', 'Transferencia'],
    datasets: [{
      data: [efectivoMonto, transferenciaMonto],
      backgroundColor: [
        '#FF6B35',  // Naranja principal
        '#6B7280',  // Gris para tema oscuro
      ],
      borderColor: [
        '#FF6B35',
        '#6B7280',
      ],
      borderWidth: 3,
      hoverOffset: 10,
      hoverBorderWidth: 4
    }]
  }), [efectivoMonto, transferenciaMonto]); // Dependencias: efectivoMonto y transferenciaMonto

  // Validar y preparar datos para el gráfico de barras (ventas semanales)
  const { datosEstadisticas, etiquetasDias } = useMemo(() => {
    let datosEstadisticas = [];
    let etiquetasDias = [];

    if (Array.isArray(estadisticasSemanal) && estadisticasSemanal.length > 0) {
      // Usar datos reales
      etiquetasDias = estadisticasSemanal.map(item => {
        // Formatear el día para que sea más legible
        const dia = item.dia || item.fecha || 'N/A';
        if (dia.length > 3) {
          // Si es una fecha completa, extraer el día
          try {
            const fecha = new Date(dia);
            return format(fecha, 'EEE', { locale: es });  // Formatear con date-fns
          } catch {
            return dia.substring(0, 3);
          }
        }
        return dia;
      });
      datosEstadisticas = estadisticasSemanal.map(item => item.monto || 0);
    } else {
      // Datos de fallback si no hay datos válidos
      etiquetasDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      datosEstadisticas = [12000, 8000, 15000, 10000, 20000, 25000, 18000];
      console.log('⚠️ Usando datos de fallback para estadísticas semanales');
    }

    return { datosEstadisticas, etiquetasDias };
  }, [estadisticasSemanal]); // Dependencia: estadisticasSemanal

  const datosBarras = useMemo(() => ({
    labels: etiquetasDias,
    datasets: [{
      label: 'Ventas por día',
      data: datosEstadisticas,
      backgroundColor: 'rgba(255, 107, 53, 0.8)',
      borderColor: '#FF6B35',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: 'rgba(255, 107, 53, 1)',
      hoverBorderColor: '#FF6B35',
      hoverBorderWidth: 3
    }]
  }), [etiquetasDias, datosEstadisticas]); // Dependencias: etiquetasDias y datosEstadisticas

  // Opciones para el gráfico de dona
  const opcionesDonut = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#D1D5DB',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#FF6B35',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((context.parsed / total) * 100) : 0;
            return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%',
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1500,
      easing: 'easeInOutQuart'
    }
  }), []); // No hay dependencias, las opciones son estáticas

  // Opciones para el gráfico de barras
  const opcionesBarras = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Ventas Semanales',
        color: '#F9FAFB',
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#FF6B35',
        borderWidth: 1,
        cornerRadius: 12,
        callbacks: {
          label: function (context) {
            return `Ventas: $${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.5)',
          borderColor: 'rgba(75, 85, 99, 0.5)'
        },
        ticks: {
          color: '#D1D5DB',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
          borderColor: 'rgba(75, 85, 99, 0.5)'
        },
        ticks: {
          color: '#D1D5DB',
          font: {
            size: 12
          },
          callback: function (value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    }
  }), []); // No hay dependencias, las opciones son estáticas

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Gráfico de dona - Métodos de pago */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Métodos de Pago Hoy</h3>
            <p className="text-sm text-gray-400">Distribución de pagos del día</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-400">
              ${totalMetodos.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">Total del día</p>
          </div>
        </div>

        <div className="relative h-80">
          {totalMetodos > 0 ? (
            <Doughnut data={datosDonut} options={opcionesDonut} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">No hay datos de pagos disponibles</p>
              </div>
            </div>
          )}
        </div>

        {/* Detalles adicionales */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-300">Efectivo</span>
            </div>
            <p className="text-lg font-bold text-white mt-1">
              ${efectivoMonto.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">
              {metodosPagoHoy?.efectivo?.cantidad || 0} transacciones
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-300">Transferencia</span>
            </div>
            <p className="text-lg font-bold text-white mt-1">
              ${transferenciaMonto.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">
              {metodosPagoHoy?.transferencia?.cantidad || 0} transacciones
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico de barras - Estadísticas semanales */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Tendencia Semanal</h3>
            <p className="text-sm text-gray-400">Ventas de los últimos 7 días</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-400">
              ${datosEstadisticas.reduce((a, b) => a + b, 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">Total semanal</p>
          </div>
        </div>

        <div className="relative h-80">
          <Bar data={datosBarras} options={opcionesBarras} />
        </div>

        {/* Estadísticas rápidas */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-400">Promedio diario</p>
            <p className="text-lg font-bold text-white">
              ${Math.round(datosEstadisticas.reduce((a, b) => a + b, 0) / datosEstadisticas.length || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Día más alto</p>
            <p className="text-lg font-bold text-orange-400">
              ${Math.max(...datosEstadisticas).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Día más bajo</p>
            <p className="text-lg font-bold text-gray-300">
              ${Math.min(...datosEstadisticas).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoughnutChart;