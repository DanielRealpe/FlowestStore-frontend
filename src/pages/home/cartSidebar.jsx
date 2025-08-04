import { useCart } from "./cartContext"
import { X, ShoppingCart, Minus, Plus, Trash2, ShoppingBag, CreditCard } from "lucide-react"
import { useState } from "react"
import PedidoCustomerModal from "./pedidoCustomer"

export function CartSidebar() {
    const { state, dispatch } = useCart()
    const { items, isOpen } = state
    const [showPedidoModal, setShowPedidoModal] = useState(false)

    const total = items.reduce(
        (acc, item) => acc + item.precio * item.cantidad,
        0
    )

    const itemCount = items.reduce((acc, item) => acc + item.cantidad, 0)

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={() => dispatch({ type: "CLOSE_CART" })}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-all duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                            <ShoppingCart className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-slate-900">Carrito de compras</h2>
                            <p className="text-sm text-slate-500">
                                {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => dispatch({ type: "CLOSE_CART" })}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col h-full">
                    {items.length === 0 ? (
                        // Empty state
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                <ShoppingBag className="w-12 h-12 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                                Tu carrito está vacío
                            </h3>
                            <p className="text-slate-500 mb-6">
                                Agrega algunos productos para comenzar
                            </p>
                            <button
                                onClick={() => dispatch({ type: "CLOSE_CART" })}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                            >
                                Continuar comprando
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Items list */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-start space-x-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                                    >
                                        {/* Product image */}
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
                                                {item.imagen ? (
                                                    <img
                                                        src={item.imagen}
                                                        alt={item.nombre}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="text-indigo-600 text-xl font-bold">
                                                            {item.nombre[0]}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Product info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-slate-900 truncate mb-1">
                                                {item.nombre}
                                            </h4>
                                            <p className="text-sm text-slate-500 mb-3">
                                                ${item.precio} c/u
                                            </p>

                                            {/* Quantity controls */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
                                                    <button
                                                        onClick={() =>
                                                            dispatch({ type: "DECREMENT", payload: item.id })
                                                        }
                                                        className="p-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all"
                                                        disabled={item.cantidad <= 1}
                                                    >
                                                        <Minus className="w-3 h-3 text-slate-600" />
                                                    </button>
                                                    <span className="px-3 py-1.5 text-sm font-medium text-slate-900 min-w-[2rem] text-center">
                                                        {item.cantidad}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            dispatch({ type: "INCREMENT", payload: item.id })
                                                        }
                                                        className="p-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all"
                                                    >
                                                        <Plus className="w-3 h-3 text-slate-600" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    <span className="font-semibold text-slate-900">
                                                        ${(item.precio * item.cantidad).toFixed(2)}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            dispatch({ type: "REMOVE_ITEM", payload: item.id })
                                                        }
                                                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors group"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary and checkout */}
                            <div className="border-t border-slate-200 p-6 bg-slate-50">
                                {/* Subtotal */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Subtotal ({itemCount} {itemCount === 1 ? 'artículo' : 'artículos'})</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Envío</span>
                                        <span className="text-green-600 font-medium">Gratis</span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center text-xl font-bold text-slate-900 mb-6 pt-2 border-t border-slate-200">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>

                                {/* Checkout button */}
                                <button
                                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    disabled={items.length === 0}
                                    onClick={() => setShowPedidoModal(true)}
                                >
                                    <CreditCard className="w-5 h-5" />
                                    <span>Finalizar compra</span>
                                </button>

                                {/* Continue shopping */}
                                <button
                                    onClick={() => dispatch({ type: "CLOSE_CART" })}
                                    className="w-full mt-3 text-indigo-600 py-3 rounded-xl font-medium hover:bg-indigo-50 transition-colors"
                                >
                                    Continuar comprando
                                </button>
                            </div>
                        </>
                    )}
                </div>

            </div>
            <PedidoCustomerModal
                open={showPedidoModal}
                onClose={() => setShowPedidoModal(false)}
                onPedidoGuardado={() => { /* Puedes mostrar un toast o redirigir */ }}
            />
        </>
    )
}