import React, { useState } from "react";
import { apiService } from "../services/api";
import "./AdminLogin.css";

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiService.adminLogin(credentials);

      if (response.success) {
        localStorage.setItem("adminToken", response.token);
        onLoginSuccess(response.token);
      } else {
        setError(response.message || "Erreur de connexion");
      }
    } catch (error) {
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>🔐 Administration</h1>
          <p>Connexion au panneau d'administration BatchCook</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              placeholder="Entrez votre nom d'utilisateur"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Entrez votre mot de passe"
            />
          </div>

          {error && <div className="error-message">❌ {error}</div>}

          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="admin-login-footer">
          <small>Accès réservé aux administrateurs</small>
        </div>
      </div>
    </div>
  );
}
