import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import "./AdminDashboard.css";

interface BatchCookingRequest {
  id: string;
  user: string;
  email: string;
  date: string;
  cart: {
    items: Array<{
      dish: { name: string };
      quantity: number;
      servings: number;
      adjustedPrice: number;
    }>;
    totalPrice: number;
    contact?: {
      phone?: string;
      message?: string;
    };
  };
  status: string;
  createdAt: string;
}

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

export default function AdminDashboard({
  token,
  onLogout,
}: AdminDashboardProps) {
  const [requests, setRequests] = useState<BatchCookingRequest[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<BatchCookingRequest | null>(null);

  useEffect(() => {
    loadRequests();
  }, [token]);

  const loadRequests = async () => {
    try {
      console.log("📥 Chargement des demandes...");
      const response = await apiService.adminGetBatchCookingRequests(token);
      console.log("📊 Réponse du serveur:", response);
      
      if (response.success) {
        console.log(`📋 ${response.requests?.length || 0} demandes reçues`);
        setRequests(response.requests || []);
        setStats(
          response.stats || {
            total: 0,
            pending: 0,
            confirmed: 0,
            completed: 0,
          },
        );
        
        // Log des statuts pour diagnostic
        response.requests?.forEach((req: any) => {
          console.log(`  - Demande ${req.id}: ${req.status}`);
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des demandes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      console.log(`🔄 Tentative de mise à jour du statut: ${requestId} -> ${newStatus}`);
      
      const response = await apiService.adminUpdateRequestStatus(
        token,
        requestId,
        { status: newStatus },
      );
      
      console.log("📡 Réponse de l'API:", response);
      
      if (response.success) {
        console.log("✅ Mise à jour réussie, rechargement des données...");
        
        // Attendre un peu pour s'assurer que la base de données est mise à jour
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Recharger les demandes
        await loadRequests();
        
        // Mettre à jour la demande sélectionnée si elle correspond
        if (selectedRequest?.id === requestId) {
          const updatedSelectedRequest = { ...selectedRequest, status: newStatus };
          setSelectedRequest(updatedSelectedRequest);
          console.log("🔄 Demande sélectionnée mise à jour:", updatedSelectedRequest);
        }
        
        // Forcer un re-render en mettant à jour l'état
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === requestId ? { ...req, status: newStatus } : req
          )
        );
        
        console.log("🔄 Données rechargées et interface mise à jour");
      } else {
        console.error("❌ Échec de la mise à jour:", response.message);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "confirmed":
        return "#10b981";
      case "completed":
        return "#6366f1";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "confirmed":
        return "Confirmé";
      case "completed":
        return "Terminé";
      default:
        return status;
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

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des demandes...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>🍳 BatchCook Admin</h1>
          <button onClick={onLogout} className="logout-button">
            Déconnexion
          </button>
        </div>
      </header>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total demandes</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "#f59e0b" }}>
            {stats.pending}
          </div>
          <div className="stat-label">En attente</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "#10b981" }}>
            {stats.confirmed}
          </div>
          <div className="stat-label">Confirmées</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "#6366f1" }}>
            {stats.completed}
          </div>
          <div className="stat-label">Terminées</div>
        </div>
      </div>

      <div className="admin-content">
        <div className="requests-list">
          <h2>Demandes de Batch Cooking</h2>
          {requests.length === 0 ? (
            <p className="no-requests">Aucune demande pour le moment.</p>
          ) : (
            <div className="requests-table">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`request-row ${selectedRequest?.id === request.id ? "selected" : ""}`}
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="request-basic-info">
                    <div className="request-user">
                      <strong>{request.user}</strong>
                      <small>{request.email}</small>
                    </div>
                    <div className="request-date">
                      {formatDate(request.createdAt)}
                    </div>
                    <div className="request-total">
                      {request.cart.totalPrice ? Number(request.cart.totalPrice).toFixed(2) : 'N/A'}€
                    </div>
                    <div className="request-status">
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(request.status),
                        }}
                      >
                        {getStatusLabel(request.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedRequest && (
          <div className="request-details">
            <div className="request-details-header">
              <h3>Détails de la demande</h3>
              <button
                className="close-details"
                onClick={() => setSelectedRequest(null)}
              >
                ×
              </button>
            </div>

            <div className="request-info">
              <div className="info-section">
                <h4>Client</h4>
                <p>
                  <strong>Nom:</strong> {selectedRequest.user}
                </p>
                <p>
                  <strong>Email:</strong> {selectedRequest.email}
                </p>
                {selectedRequest.userPhone && (
                  <p>
                    <strong>Téléphone (compte):</strong> {selectedRequest.userPhone}
                  </p>
                )}
                {selectedRequest.cart.contact?.phone && (
                  <p>
                    <strong>Téléphone (commande):</strong>{" "}
                    {selectedRequest.cart.contact.phone}
                  </p>
                )}
                <p>
                  <strong>Date souhaitée:</strong>{" "}
                  {selectedRequest.date
                    ? formatDate(selectedRequest.date)
                    : "Non spécifiée"}
                </p>
              </div>

              <div className="info-section">
                <h4>Commande</h4>
                <div className="cart-items">
                  {selectedRequest.cart.items.map((item, index) => (
                    <div key={index} className="cart-item">
                      <span className="item-name">{item.dish.name}</span>
                      <span className="item-details">
                        {item.quantity}x • {item.servings} portions •{" "}
                        {item.adjustedPrice ? parseFloat(String(item.adjustedPrice)).toFixed(2) : 'N/A'}€
                      </span>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <strong>Total: {selectedRequest.cart.totalPrice ? Number(selectedRequest.cart.totalPrice).toFixed(2) : 'N/A'}€</strong>
                </div>
              </div>

              {selectedRequest.cart.contact?.message && (
                <div className="info-section">
                  <h4>Message du client</h4>
                  <p className="client-message">
                    {selectedRequest.cart.contact.message}
                  </p>
                </div>
              )}

              <div className="info-section">
                <h4>Actions</h4>
                <div className="status-actions">
                  <button
                    className="status-button pending"
                    onClick={() =>
                      handleStatusChange(selectedRequest.id, "pending")
                    }
                    disabled={selectedRequest.status === "pending"}
                  >
                    En attente
                  </button>
                  <button
                    className="status-button confirmed"
                    onClick={() =>
                      handleStatusChange(selectedRequest.id, "confirmed")
                    }
                    disabled={selectedRequest.status === "confirmed"}
                  >
                    Confirmer
                  </button>
                  <button
                    className="status-button completed"
                    onClick={() =>
                      handleStatusChange(selectedRequest.id, "completed")
                    }
                    disabled={selectedRequest.status === "completed"}
                  >
                    Terminer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
