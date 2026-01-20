import React from "react";
import { useCart } from "./cart/context";

export default function CartView() {
  const {
    items,
    removeDish,
    clear,
    totalPrice,
    totalTime,
    cookingPrice,
    grandTotal,
  } = useCart();

  return (
    <div className="panel">
      <div className="cart-summary">
        <h2>Votre panier</h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div className="price-badge">{grandTotal.toFixed(2)}€ total</div>
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
                    💰 {it.adjustedPrice.toFixed(2)}€
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
              {totalPrice.toFixed(2)}€
            </strong>
          </div>
          <div>
            <span style={{ color: "var(--text-secondary)" }}>
              Prix de cuisine (14€/h) :
            </span>
            <br />
            <strong style={{ fontSize: "1.1rem", color: "var(--accent)" }}>
              {cookingPrice.toFixed(2)}€
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
            {grandTotal.toFixed(2)}€
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button className="ghost" onClick={clear}>
          Vider le panier
        </button>
      </div>
    </div>
  );
}
