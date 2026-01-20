import React, { useState, useEffect } from "react";
import "./UserProfile.css";

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface UserProfileProps {
  user: User;
  onLogout: () => void;
  onBackToHome: () => void;
}

export default function UserProfile({
  user,
  onLogout,
  onBackToHome,
}: UserProfileProps) {
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadUserRequests();
  }, []);

  const loadUserRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("Token d'authentification manquant");
        return;
      }

      const response = await fetch(
        `http://localhost:3001/api/user/batch-cooking-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setUserRequests(data.requests || []);
      } else {
        setError(data.message || "Erreur lors du chargement des demandes");
      }
    } catch (error) {
      console.error("Error loading user requests:", error);
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "En attente", class: "status-pending", emoji: "⏳" },
      confirmed: { label: "Confirmé", class: "status-confirmed", emoji: "✅" },
      completed: { label: "Terminé", class: "status-completed", emoji: "🎉" },
      cancelled: { label: "Annulé", class: "status-cancelled", emoji: "❌" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`status-badge ${config.class}`}>
        {config.emoji} {config.label}
      </span>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    onLogout();
  };

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedRequest(null);
    setShowDetailsModal(false);
  };

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <div className="user-info">
          <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <h1>👤 Profil Utilisateur</h1>
            <p className="user-name">{user.name}</p>
            <p className="user-email">{user.email}</p>
            <p className="user-since">
              Membre depuis le {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={onBackToHome} className="back-home-btn">
            🏠 Accueil
          </button>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Déconnexion
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="requests-section">
          <div className="section-header">
            <h2>📋 Mes demandes de Batch Cooking</h2>
            <div className="requests-count">
              {userRequests.length} demande
              {userRequests.length !== 1 ? "s" : ""}
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Chargement de vos demandes...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>⚠️ {error}</p>
              <button onClick={loadUserRequests} className="retry-btn">
                🔄 Réessayer
              </button>
            </div>
          ) : userRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍳</div>
              <h3>Aucune demande pour le moment</h3>
              <p>
                Commencez par ajouter des plats à votre panier pour créer votre
                première demande de batch cooking !
              </p>
            </div>
          ) : (
            <div className="requests-list">
              {userRequests.map((request, index) => (
                <div key={request.id || index} className="request-card">
                  <div className="request-header">
                    <div className="request-info">
                      <h3>Demande #{request.id || index + 1}</h3>
                      <p className="request-date">
                        Créée le {formatDate(request.createdAt)}
                      </p>
                    </div>
                    {getStatusBadge(request.status || "pending")}
                  </div>

                  <div className="request-details">
                    {request.user && (
                      <div className="detail-item">
                        <strong>Nom:</strong> {request.user}
                      </div>
                    )}
                    {request.email && (
                      <div className="detail-item">
                        <strong>Email:</strong> {request.email}
                      </div>
                    )}
                    {request.cart && request.cart.length > 0 && (
                      <div className="detail-item">
                        <strong>Plats commandés:</strong>
                        <div className="cart-items">
                          {request.cart.map((item: any, itemIndex: number) => (
                            <div key={itemIndex} className="cart-item">
                              <span className="item-name">
                                {item.nom || item.name}
                              </span>
                              <span className="item-quantity">
                                x{item.portions || item.quantity || 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="request-actions">
                    <button
                      className="view-details-btn"
                      onClick={() => handleViewDetails(request)}
                    >
                      👁️ Voir détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="profile-stats">
          <h2>📊 Statistiques</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{userRequests.length}</div>
              <div className="stat-label">Demandes totales</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {userRequests.filter((r) => r.status === "completed").length}
              </div>
              <div className="stat-label">Terminées</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {userRequests.filter((r) => r.status === "pending").length}
              </div>
              <div className="stat-label">En attente</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de détails */}
      {showDetailsModal && selectedRequest && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Détails de la demande</h2>
              <button className="close-btn" onClick={closeDetailsModal}>
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="request-info">
                <div className="info-row">
                  <span className="label">📅 Date demandée:</span>
                  <span className="value">
                    {formatDate(selectedRequest.date)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">⏰ Commandé le:</span>
                  <span className="value">
                    {formatDate(selectedRequest.createdAt)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">📊 Statut:</span>
                  <span className="value">
                    {getStatusBadge(selectedRequest.status)}
                  </span>
                </div>
              </div>

              <div className="dishes-section">
                <h3>🍽️ Plats commandés</h3>
                <div className="dishes-list">
                  {selectedRequest.cart.items?.map(
                    (item: any, index: number) => (
                      <div key={index} className="dish-detail-card">
                        <div className="dish-header">
                          <h4 className="dish-name">{item.dish.name}</h4>
                          <div className="dish-meta">
                            <span className="quantity">
                              Quantité: {item.quantity}
                            </span>
                            <span className="servings">
                              Portions: {item.servings}
                            </span>
                                    <span className="price">
                                      {item.adjustedPrice
                                        ? Number(item.adjustedPrice).toFixed(2)
                                : "N/A"}
                              €
                            </span>
                          </div>
                        </div>

                        {item.dish.ingredients && (
                          <div className="ingredients-section">
                            <h5>🥕 Ingrédients:</h5>
                            <div className="ingredients-grid">
                              {item.dish.ingredients.map(
                                (ingredient: any, ingredientIndex: number) => {
                                  // Calcul sécurisé des quantités
                                  const baseQuantity =
                                    parseFloat(ingredient.quantity) || 0;
                                  const itemServings =
                                    parseInt(item.servings) || 1;
                                  const recipeServings =
                                    parseInt(item.dish.recipe?.servings) || 4;

                                  // Calculer la quantité ajustée selon les portions demandées
                                  const adjustedQuantity =
                                    (baseQuantity * itemServings) /
                                    recipeServings;

                                  // S'assurer que le résultat n'est pas NaN et l'arrondir
                                  const finalQuantity = isNaN(adjustedQuantity)
                                    ? baseQuantity
                                    : adjustedQuantity;
                                  const displayQuantity =
                                    finalQuantity > 0
                                      ? Math.round(finalQuantity * 10) / 10
                                      : baseQuantity;

                                  return (
                                    <div
                                      key={ingredientIndex}
                                      className="ingredient-item"
                                    >
                                      <span className="ingredient-name">
                                        {ingredient.name}
                                      </span>
                                      <span className="ingredient-amount">
                                        {displayQuantity}{" "}
                                        {ingredient.unit || "unité"}
                                      </span>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  ) ||
                    // Fallback pour l'ancien format
                    (selectedRequest.cart.map &&
                      selectedRequest.cart.map((item: any, index: number) => (
                        <div key={index} className="dish-detail-card">
                          <div className="dish-header">
                            <h4 className="dish-name">
                              {item.nom || item.name}
                            </h4>
                            <div className="dish-meta">
                              <span className="quantity">
                                Portions: {item.portions || item.quantity || 1}
                              </span>
                            </div>
                          </div>
                        </div>
                      )))}
                </div>
              </div>

              <div className="total-section">
                <div className="total-price">
                  <span className="total-label">💰 Total:</span>
                  <span className="total-amount">
                    {selectedRequest.cart.totalPrice
                      ? Number(selectedRequest.cart.totalPrice).toFixed(2)
                      : "N/A"}
                    €
                  </span>
                </div>
              </div>

              {selectedRequest.cart.contact?.message && (
                <div className="message-section">
                  <h4>💬 Message:</h4>
                  <p className="user-message">
                    {selectedRequest.cart.contact.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
