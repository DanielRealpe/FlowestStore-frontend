import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { fetchCategoriasDeLaHomePage } from "../categorias/api/categoriaService"
import { fetchProductos } from "../productos/api/ProductoService"
import { ShoppingCart, User, LogOut, Search, Star, Heart, Filter, Grid, List, ChevronDown, Menu, X } from "lucide-react"
import { useCart } from "./cartContext"
import { CartSidebar } from "./cartSidebar"
import { useAuth } from "../usuarios/context/AuthContext"

export function Home() {
    const navigate = useNavigate()
    const { state, dispatch } = useCart()
    const [categorias, setCategorias] = useState([])
    const [productos, setProductos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { user, isAuthenticated, signout } = useAuth()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState("grid")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [wishlist, setWishlist] = useState([])
    const dropdownRef = useRef(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [cats, prods] = await Promise.all([fetchCategoriasDeLaHomePage(), fetchProductos()])
                setCategorias(cats.data)
                setProductos(prods)
            } catch (err) {
                console.error("Error al cargar datos de la tienda:", err)
                setError("No se pudieron cargar los productos o categorías.")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Cerrar el dropdown si se hace click fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false)
            }
        }
        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        } else {
            document.removeEventListener("mousedown", handleClickOutside)
        }
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [dropdownOpen])

    // Función para toggle wishlist
    const toggleWishlist = (productId) => {
        setWishlist(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }

    // Agrupar productos por categoría
    const categoriasUnicas = [
        ...new Map(
            productos
                .filter((prod) => prod.Categorium && prod.Categorium.nombre)
                .map((prod) => [prod.Categorium.nombre, prod.Categorium])
        ).values(),
    ]

    // Filtrar productos
    const filteredProducts = productos.filter(producto => {
        const matchesSearch = producto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            producto.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === "all" ||
            (producto.Categorium && producto.Categorium.nombre === selectedCategory)
        const isActive = producto.estado === "activo"
        return matchesSearch && matchesCategory && isActive
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <span className="text-lg text-slate-700 font-medium">Cargando tienda...</span>
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

    return (
        <div className="min-h-screen bg-white">
            {/* Header moderno */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Flowest
                                </h1>
                            </div>
                        </div>

                        {/* Barra de búsqueda - Desktop */}
                        <div className="hidden md:block flex-1 max-w-lg mx-8">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
                                />
                            </div>
                        </div>

                        {/* Acciones del header */}
                        <div className="flex items-center space-x-4">
                            {/* Usuario autenticado */}
                            {isAuthenticated && user ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">
                                                {(user.nombreCompleto || user.nombre || user.email || "U")[0].toUpperCase()}
                                            </span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2">
                                            <div className="px-4 py-2 border-b border-slate-100">
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    {user.nombreCompleto || user.nombre || user.email}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                            </div>
                                            <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2">
                                                <User className="w-4 h-4" />
                                                <span>Mi perfil</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDropdownOpen(false)
                                                    signout()
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Cerrar sesión</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => navigate("/login")}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors font-medium"
                                >
                                    Iniciar sesión
                                </button>
                            )}

                            {/* Carrito */}
                            <button
                                onClick={() => dispatch({ type: "TOGGLE_CART" })}
                                className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <ShoppingCart className="w-6 h-6 text-slate-700" />
                                {state.items.length > 0 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                        <span className="text-xs text-white font-medium">{state.items.length}</span>
                                    </div>
                                )}
                            </button>

                            {/* Menú móvil */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg hover:bg-slate-100"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Barra de búsqueda móvil */}
                    <div className="md:hidden pb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
                        Descubre productos
                        <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            extraordinarios
                        </span>
                    </h2>
                    <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                        Una cuidadosa selección de productos de calidad premium para tu estilo de vida
                    </p>
                </div>
            </section>

            {/* Filtros y controles */}
            <section className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Filtro por categoría */}
                        <div className="flex items-center space-x-4">
                            <Filter className="w-5 h-5 text-slate-600" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="all">Todas las categorías</option>
                                {categoriasUnicas.map((categoria) => (
                                    <option key={categoria.id || categoria.nombre} value={categoria.nombre}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Vista y resultados */}
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-slate-600">
                                {filteredProducts.length} productos
                            </span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded-lg transition-colors ${viewMode === "grid"
                                        ? "bg-indigo-100 text-indigo-600"
                                        : "text-slate-600 hover:bg-slate-100"
                                        }`}
                                >
                                    <Grid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded-lg transition-colors ${viewMode === "list"
                                        ? "bg-indigo-100 text-indigo-600"
                                        : "text-slate-600 hover:bg-slate-100"
                                        }`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Productos */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-12 h-12 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-medium text-slate-900 mb-2">No se encontraron productos</h3>
                        <p className="text-slate-600">
                            {searchQuery ? "Intenta con otros términos de búsqueda" : "No hay productos disponibles en esta categoría"}
                        </p>
                    </div>
                ) : (
                    <div className={
                        viewMode === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                            : "space-y-6"
                    }>
                        {filteredProducts.map((producto) => (
                            <div
                                key={producto.id}
                                className={`group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 overflow-hidden ${viewMode === "list" ? "flex items-center p-6" : "flex flex-col"
                                    }`}
                            >
                                {/* Imagen del producto */}
                                <div className={`relative overflow-hidden ${viewMode === "list"
                                    ? "w-24 h-24 rounded-xl flex-shrink-0"
                                    : "aspect-square"
                                    }`}>
                                    {producto.imagen ? (
                                        <img
                                            src={producto.imagen}
                                            alt={producto.nombre}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                            <span className="text-3xl font-bold text-indigo-600">
                                                {producto.nombre[0]}
                                            </span>
                                        </div>
                                    )}

                                    {/* Botón wishlist */}
                                    <button
                                        onClick={() => toggleWishlist(producto.id)}
                                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm"
                                    >
                                        <Heart
                                            className={`w-4 h-4 ${wishlist.includes(producto.id)
                                                ? "text-red-500 fill-current"
                                                : "text-slate-400"
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Información del producto */}
                                <div className={`${viewMode === "list" ? "flex-1 ml-6" : "p-6"}`}>
                                    <div className={viewMode === "list" ? "flex items-center justify-between" : ""}>
                                        <div className={viewMode === "list" ? "flex-1" : ""}>
                                            <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                                {producto.nombre}
                                            </h3>
                                            <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                                                {producto.descripcion}
                                            </p>

                                            {/* Rating placeholder */}
                                            <div className="flex items-center space-x-1 mb-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                                ))}
                                                <span className="text-sm text-slate-500 ml-2">(4.8)</span>
                                            </div>
                                        </div>

                                        <div className={`${viewMode === "list" ? "ml-6 text-right" : ""}`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-2xl font-bold text-slate-900">
                                                    ${parseFloat(producto.precio.replace(",", "."))}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => dispatch({
                                                    type: "ADD_ITEM",
                                                    payload: {
                                                        id: producto.id,
                                                        nombre: producto.nombre,
                                                        precio: producto.precio,
                                                        imagen: producto.imagen,
                                                    }
                                                })}
                                                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow-md"
                                            >
                                                Agregar al carrito
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-2">
                            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                Flowest
                            </h3>
                            <p className="text-slate-300 mb-4 max-w-md">
                                Tu destino para productos excepcionales. Calidad premium, servicio extraordinario.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Enlaces</h4>
                            <ul className="space-y-2 text-slate-300">
                                <li><a href="#" className="hover:text-white transition-colors">Sobre nosotros</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Ayuda</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-slate-300">
                                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Devoluciones</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-400">
                        <p>&copy; {new Date().getFullYear()} Flowest. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>

            <CartSidebar />
        </div>
    )
}