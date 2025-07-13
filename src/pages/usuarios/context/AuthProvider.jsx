"use client"

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsuarioAutenticado, loginUsuario, logoutUsuario } from "../api/usuarioService.js";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getUsuarioAutenticado();
        if (!userData) throw new Error("No user data");

        setUser(userData);
        setIsAuthenticated(true);

        if (window.location.pathname === '/login') {
          navigate("/dashboard");
        }
      } catch {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const signin = async (credentials) => {
    setLoading(true);
    setErrors([]);
    try {
      await loginUsuario(credentials);
      await new Promise(resolve => setTimeout(resolve, 100));
      const userData = await getUsuarioAutenticado();
      setUser(userData);
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setErrors([error.response?.data?.mensaje || "Credenciales incorrectas"]);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const signout = async () => {
    try {
      await logoutUsuario();
      setUser(null);
      setIsAuthenticated(false);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const hasRole = (role) => user?.id_rol === role;
  const hasPermission = (recurso, accion) =>
    user?.permisos?.some((p) => p.recurso === recurso && p.accion === accion) || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        loading,
        errors,
        signin,
        signout,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
