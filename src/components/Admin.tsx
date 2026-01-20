import React, { useState, useEffect } from "react";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

interface AdminProps {
  user?: any;
  onLogout?: () => void;
}

export default function Admin({ user, onLogout }: AdminProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Si un utilisateur admin est passé en props, l'utiliser directement
    if (user && user.isAdmin) {
      const userToken = localStorage.getItem("userToken");
      setToken(userToken || "admin-token");
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    // Sinon, vérifier si un token admin séparé est stocké (ancien système)
    const savedToken = localStorage.getItem("adminToken");
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [user]);

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (onLogout) {
      // Utiliser la fonction de déconnexion passée en props (déconnexion complète)
      onLogout();
    } else {
      // Ancien système admin séparé
      localStorage.removeItem("adminToken");
      setToken(null);
      setIsAuthenticated(false);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#f8fafc",
        }}
      >
        <div>Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard token={token} onLogout={handleLogout} />;
}
