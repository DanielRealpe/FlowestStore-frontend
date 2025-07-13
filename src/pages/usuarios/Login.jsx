import LoginForm from "./components/LoginForm"

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-white">Sistema de Gestión</h1>
        <p className="mt-2 text-center text-sm text-gray-400">Acceso para administradores</p>
      </div>
      <LoginForm />
    </div>
  )
}

export default LoginPage
