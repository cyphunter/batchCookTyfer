import React, { useState } from "react";
import "./UserAuth.css";

interface UserAuthProps {
  onAuthSuccess: (user: any) => void;
  onClose?: () => void;
}

export default function UserAuth({ onAuthSuccess, onClose }: UserAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Email et mot de passe requis");
      return false;
    }

    if (!isLogin) {
      if (!formData.name) {
        setError("Le nom est requis pour l'inscription");
        return false;
      }
      if (!formData.phone) {
        setError("Le numéro de téléphone est requis pour l'inscription");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        return false;
      }
      if (formData.password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères");
        return false;
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Format d'email invalide");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            email: formData.email,
            password: formData.password,
            name: formData.name,
            phone: formData.phone,
          };

      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        // Store user data and token in localStorage
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userData", JSON.stringify(data.user));

        onAuthSuccess(data.user);

        if (onClose) onClose();
      } else {
        setError(data.message || "Erreur lors de l'authentification");
      }
    } catch (error) {
      console.error("Auth error:", error);
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      phone: "",
    });
  };

  return (
    <div className="user-auth-overlay">
      <div className="user-auth-modal">
        <div className="auth-header">
          <h2>{isLogin ? "🔐 Connexion" : "👤 Inscription"}</h2>
          {onClose && (
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Nom complet</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Votre nom complet"
                disabled={loading}
              />
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="phone">Numéro de téléphone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="06 12 34 56 78"
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="votre@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          )}

          {error && <div className="error-message">⚠️ {error}</div>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                {isLogin ? "Connexion..." : "Inscription..."}
              </>
            ) : isLogin ? (
              "🚀 Se connecter"
            ) : (
              "✨ S'inscrire"
            )}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button
              type="button"
              className="switch-btn"
              onClick={switchMode}
              disabled={loading}
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>

        <div className="auth-benefits">
          <h3>🎯 Avantages du compte utilisateur :</h3>
          <ul>
            <li>✅ Sauvegarde automatique de vos paniers</li>
            <li>✅ Historique de vos demandes de batch cooking</li>
            <li>✅ Suivi de vos commandes en temps réel</li>
            <li>✅ Préférences personnalisées</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
