// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Токен хранится ТОЛЬКО в памяти (useState)
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true); // для защиты роутов при старте

  // При старте приложения — токен НЕ восстанавливается (это нормально для in-memory)
  useEffect(() => {
    setLoading(false);
  }, []);

  const login = (token) => {
    setAuthToken(token);
  };

  const logout = () => {
    setAuthToken(null);
  };

  const isAuthenticated = !!authToken;

  return (
    <AuthContext.Provider value={{ authToken, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};