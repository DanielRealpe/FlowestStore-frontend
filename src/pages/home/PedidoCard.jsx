// --- START OF FILE PedidoCard.jsx ---

import { Calendar, Hash, Package, CheckCircle, Clock, XCircle } from "lucide-react";

const formatCurrency = (value) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value);
const formatDate = (dateString) => new Date(dateString).toLocaleDateString("es-ES", { year: 'numeric', month: 'long', day: 'numeric' });

export function PedidoCard({ pedido }) {
    const statusStyles = {
        pendiente: "bg-yellow-100 text-yellow-800",
        preparacion: "bg-blue-100 text-blue-800",
        terminado: "bg-green-100 text-green-800",
        cancelado: "bg-red-100 text-red-800",
    };
    const statusIcons = {
        pendiente: <Clock className="w-4 h-4" />,
        preparacion: <Package className="w-4 h-4" />,
        terminado: <CheckCircle className="w-4 h-4" />,
        cancelado: <XCircle className="w-4 h-4" />,
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 overflow-hidden p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-slate-200">
                <div>
                    <div className="flex items-center space-x-2 text-slate-800 font-bold text-lg">
                        <Hash className="w-5 h-5 text-indigo-600" />
                        <span>Pedido #{pedido.id}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-500 mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(pedido.fecha_pedido)}</span>
                    </div>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusStyles[pedido.estado] || "bg-slate-100 text-slate-800"}`}>
                    {statusIcons[pedido.estado]}
                    <span className="capitalize">{pedido.estado}</span>
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="font-semibold text-slate-700">Productos</h4>
                {pedido.Productos.map(producto => (
                    <div key={producto.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-3">
                            <img src={producto.imagenUrl} alt={producto.nombre} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                            <div>
                                <p className="text-slate-800 font-medium">{producto.nombre}</p>
                                <p className="text-slate-500">
                                    {producto.PedidoProducto.cantidad} x {formatCurrency(producto.PedidoProducto.precio_unitario)}
                                </p>
                            </div>
                        </div>
                        <p className="font-semibold text-slate-900">
                            {formatCurrency(producto.PedidoProducto.cantidad * producto.PedidoProducto.precio_unitario)}
                        </p>
                    </div>
                ))}
            </div>

            <div className="flex justify-end items-center pt-4 border-t border-slate-200">
                <div className="text-right">
                    <span className="text-sm text-slate-500">Total del Pedido</span>
                    <p className="text-xl font-bold text-indigo-600">{formatCurrency(pedido.total)}</p>
                </div>
            </div>
        </div>
    );
}
// --- START OF FILE MisPedidos.jsx ---

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../usuarios/context/AuthContext";
import { fetchPedidosPorCliente } from "../pedidos/api/pedidoservice";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export function MisPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user && user.id) {
            const cargarPedidos = async () => {
                try {
                    setLoading(true);
                    const data = await fetchPedidosPorCliente(user.id);
                    setPedidos(data);
                } catch (err) {
                    setError("No se pudieron cargar tus pedidos. Inténtalo de nuevo más tarde.");
                } finally {
                    setLoading(false);
                }
            };
            cargarPedidos();
        }
    }, [user]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <span className="text-lg text-slate-700 font-medium">Cargando pedidos...</span>
                    </div>
                </div>
            )
        }
        if (error) {
            return (
                <div className="flex items-center justify-center h-screen bg-red-50">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X className="w-8 h-8 text-red-600" />
                        </div>
                        <span className="text-lg text-red-700 font-medium">{error}</span>
                    </div>
                </div>
            )
        }
        if (pedidos.length === 0) {
            return (
                <div className="text-center py-20 bg-slate-50 rounded-2xl">
                    <ShoppingBag className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-slate-900 mb-2">Aún no tienes pedidos</h3>
                    <p className="text-slate-600 mb-6">Explora nuestros productos y realiza tu primera compra.</p>
                    <Link to="/" className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium inline-flex items-center space-x-2">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Volver a la tienda</span>
                    </Link>
                </div>
            );
        }
        return (
            <div className="space-y-6">
                {pedidos.map(pedido => <PedidoCard key={pedido.id} pedido={pedido} />)}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white">
            <header className="bg-white/95 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Flowest</h1>
                        <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center space-x-2">
                            <ArrowLeft className="w-4 h-4" />
                            <span>Volver a la tienda</span>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900">Mis Pedidos</h2>
                    <p className="text-slate-600 mt-2">Aquí puedes ver el historial de todas tus compras.</p>
                </div>
                {renderContent()}
            </main>
        </div>
    );
}