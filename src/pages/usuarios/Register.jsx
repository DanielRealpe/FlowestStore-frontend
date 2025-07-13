// "use client"

// import { useState } from "react"
// import { Mail, Lock, User, Shield } from "lucide-react"
// import { registrar } from "../api/usuarioApi"
// import { useNavigate } from "react-router-dom"
// import { useAuth } from "../hooks/useAuth"

// const RegisterPage = () => {
//   const [formData, setFormData] = useState({
//     nombre: "",
//     email: "",
//     password: "",
//     id_rol: 3 // Valor por defecto para cliente
//   })
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const navigate = useNavigate()
//   const { login } = useAuth()

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError(null)

//     try {
//       const response = await registrar(formData)
//       login(response.token, response.usuario)
//       navigate("/")
//     } catch (err) {
//       setError(err.response?.data?.mensaje || "Error al registrar el usuario")
//       console.error("Error:", err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <h1 className="text-center text-3xl font-extrabold text-white">
//           Crear una cuenta
//         </h1>
//       </div>
      
//       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="bg-gray-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-800">
//           {error && (
//             <div className="bg-red-900 text-white p-3 rounded-lg mb-6 flex items-center">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5 mr-2"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
//                 />
//               </svg>
//               {error}
//             </div>
//           )}
          
//           <form className="space-y-6" onSubmit={handleSubmit}>
//             <div>
//               <label htmlFor="nombre" className="block text-sm font-medium text-gray-400">
//                 Nombre Completo
//               </label>
//               <div className="mt-1 relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <User className="h-5 w-5 text-gray-500" />
//                 </div>
//                 <input
//                   id="nombre"
//                   name="nombre"
//                   type="text"
//                   required
//                   value={formData.nombre}
//                   onChange={handleChange}
//                   className="bg-gray-800 text-white pl-10 w-full p-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-400">
//                 Email
//               </label>
//               <div className="mt-1 relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-gray-500" />
//                 </div>
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="bg-gray-800 text-white pl-10 w-full p-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-400">
//                 Contraseña
//               </label>
//               <div className="mt-1 relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-500" />
//                 </div>
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   autoComplete="current-password"
//                   required
//                   minLength="6