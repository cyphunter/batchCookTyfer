import React, { useState } from "react";
import { useCart } from "./cart/context";
import BatchCookingRequestModal from "./components/BatchCookingRequestModal";

export default function CartView({ user }: { user?: any }) {
  const {
    items,
    removeDish,
    clear,
    totalPrice,
    totalTime,
    cookingPrice,
    grandTotal,
  } = useCart();

  const [showBatchCookingForm, setShowBatchCookingForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleBatchCookingSuccess = () => {
    setShowBatchCookingForm(false);
    setShowSuccessMessage(true);
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };

  return (
    <div className="panel">
      <div className="cart-summary">
        <h2>Votre panier</h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div className="price-badge">{Number(grandTotal).toFixed(2)}€ total</div>
          {totalTime > 0 && (
            <div
              style={{
                background: "var(--accent)",
                color: "white",
                padding: "6px 12px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              ⏱️ {Math.floor(totalTime / 60)}h
              {totalTime % 60 > 0 ? ` ${totalTime % 60}min` : ""}
            </div>
          )}
        </div>
      </div>

      {items.length === 0 && <p>Votre panier est vide.</p>}

      <div style={{ marginTop: 12 }}>
        {items.map((it) => (
          <div
            key={`${it.dish.id}-${it.servings}`}
            className="card"
            style={{ marginBottom: 12 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {it.dish.name}
                </div>
                <div
                  className="muted"
                  style={{ fontSize: 13, marginBottom: 8 }}
                >
                  {it.dish.description}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    marginBottom: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8rem",
                      padding: "4px 8px",
                      background: "var(--bg-secondary)",
                      borderRadius: "var(--radius-sm)",
                      fontWeight: "600",
                    }}
                  >
                    👥 {it.servings} pers.
                  </span>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      padding: "4px 8px",
                      background: "var(--bg-secondary)",
                      borderRadius: "var(--radius-sm)",
                      fontWeight: "600",
                    }}
                  >
                    ⏱️ {it.adjustedTime} min
                  </span>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      padding: "4px 8px",
                      background: "var(--bg-secondary)",
                      borderRadius: "var(--radius-sm)",
                      fontWeight: "600",
                    }}
                  >
                    💰 {it.adjustedPrice ? Number(it.adjustedPrice).toFixed(2) : 'N/A'}€
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ marginBottom: 6, fontWeight: 600 }}>
                  Quantité: {it.quantity}
                </div>
                <button
                  className="ghost"
                  onClick={() => removeDish(it.dish.id, it.servings)}
                  style={{ fontSize: "0.8rem" }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "16px",
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <strong style={{ fontSize: "1.1rem" }}>Récapitulatif :</strong>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px",
            fontSize: "0.9rem",
          }}
        >
          <div>
            <span style={{ color: "var(--text-secondary)" }}>
              Prix total des ingrédients :
            </span>
            <br />
            <strong style={{ fontSize: "1.1rem", color: "var(--primary)" }}>
              {Number(totalPrice).toFixed(2)}€
            </strong>
          </div>
          <div>
            <span style={{ color: "var(--text-secondary)" }}>
              Prix de cuisine (14€/h) :
            </span>
            <br />
            <strong style={{ fontSize: "1.1rem", color: "var(--accent)" }}>
              {Number(cookingPrice).toFixed(2)}€
            </strong>
          </div>
          <div>
            <span style={{ color: "var(--text-secondary)" }}>
              Temps total :
            </span>
            <br />
            <strong style={{ fontSize: "1.1rem", color: "var(--success)" }}>
              {totalTime > 0
                ? `${Math.floor(totalTime / 60)}h${totalTime % 60 > 0 ? ` ${totalTime % 60}min` : ""}`
                : "0min"}
            </strong>
          </div>
        </div>
        <div
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "2px solid var(--border-color)",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: "4px" }}>
            <span
              style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
            >
              TOTAL FINAL :
            </span>
          </div>
          <div
            style={{
              fontSize: "1.4rem",
              fontWeight: "700",
              color: "var(--primary)",
              background:
                "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {Number(grandTotal).toFixed(2)}€
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button className="ghost" onClick={clear}>
          Vider le panier
        </button>
        {items.length > 0 && (
          <button
            style={{
              marginLeft: "12px",
              background:
                "linear-gradient(135deg, var(--accent) 0%, #f59e0b 100%)",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onClick={() => setShowBatchCookingForm(true)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(217, 119, 6, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            🍳 Faire une demande de batch cooking
          </button>
        )}
      </div>

      {showSuccessMessage && (
        <div className="success-message" style={{ marginTop: "1rem" }}>
          <h3>✅ Demande envoyée avec succès !</h3>
          <p>
            Nous vous recontacterons dans les plus brefs délais pour planifier
            votre session de batch cooking.
          </p>
        </div>
      )}

      {showBatchCookingForm && (
        <BatchCookingRequestModal
          isOpen={showBatchCookingForm}
          onClose={() => setShowBatchCookingForm(false)}
          cart={{
            items,
            totalItems: items.length,
            totalPrice: grandTotal,
          }}
          user={user}
        />
      )}
    </div>
  );
}
