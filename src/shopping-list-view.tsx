import React from "react";
import { useCart } from "./cart/context";
import { intermarcheAPI } from "./services/intermarche-api";

export default function ShoppingListView() {
  const { shoppingList } = useCart();
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleAddToIntermarche = async () => {
    if (shoppingList.length === 0) return;

    setLoading(true);
    setMessage(null);

    try {
      // Extract ingredient names for API call
      const ingredientNames = shoppingList.map((ing) => ing.name);

      // Synchronize with Intermarché cart using real API
      const result = await intermarcheAPI.synchronizeCart(ingredientNames);

      if (result.success) {
        let successMsg = `✅ ${result.addedItems || 0} produits ajoutés au panier Intermarché !`;
        if (result.cartId) {
          successMsg += ` (ID: ${result.cartId.substring(0, 8)}...)`;
        }
        if (result.errors && result.errors.length > 0) {
          successMsg += `\n⚠️ ${result.errors.join(", ")}`;
        }
        setMessage(successMsg);
      } else {
        setMessage(
          `❌ Erreur: ${result.errors?.join(", ") || "Erreur inconnue"}`,
        );
      }
    } catch (error) {
      setMessage(
        `❌ Erreur de connexion: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel shopping-list">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2>Liste de courses</h2>
        {shoppingList.length > 0 && (
          <button
            onClick={handleAddToIntermarche}
            disabled={loading}
            style={{
              background: loading ? "#ccc" : "#e60012",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {loading ? "⏳" : "🛒"}
            {loading ? "Ajout en cours..." : "Ajouter à mon panier Intermarché"}
          </button>
        )}
      </div>

      {message && (
        <div
          style={{
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "1rem",
            background: message.startsWith("✅") ? "#d4edda" : "#f8d7da",
            border: `1px solid ${message.startsWith("✅") ? "#c3e6cb" : "#f5c6cb"}`,
            color: message.startsWith("✅") ? "#155724" : "#721c24",
            whiteSpace: "pre-line",
            fontSize: "14px",
            lineHeight: "1.4",
          }}
        >
          {message}
        </div>
      )}

      {shoppingList.length === 0 && (
        <p>Ajoutez des plats au panier pour générer la liste.</p>
      )}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {shoppingList.map((ing) => (
          <li
            key={ing.name}
            style={{
              padding: "8px 0",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: "500" }}>{ing.name}</span>
            {ing.quantity && ing.unit && (
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  background: "var(--bg-secondary)",
                  padding: "4px 8px",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: "600",
                }}
              >
                {ing.quantity} {ing.unit}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
