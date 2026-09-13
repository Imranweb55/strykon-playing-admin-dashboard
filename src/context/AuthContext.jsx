import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

const TOKEN_KEY = "strykon_admin_token";

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if a token is already saved and still valid
  useEffect(() => {
    const verifyExistingSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axiosInstance.get("/auth/me");
        setAdmin(data.admin);
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    verifyExistingSession();
  }, []);

  const login = async (email, password) => {
    const { data } = await axiosInstance.post("/auth/login", {
      email,
      password,
    });
    localStorage.setItem(TOKEN_KEY, data.token);
    setAdmin(data.admin);
    return data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
