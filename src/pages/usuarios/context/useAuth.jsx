import { useContext } from "react";
import { AuthContext } from "./AuthContext"; // ajusta la ruta si es necesario

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

export default useAuth;
