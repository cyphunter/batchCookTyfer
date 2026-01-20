import React, { useState } from "react";
import { useCart } from "../cart/context";
import { apiService } from "../services/api";

interface BatchCookingRequestFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BatchCookingRequestForm({
  onClose,
  onSuccess,
}: BatchCookingRequestFormProps) {
  const { items, grandTotal } = useCart();
  const [formData, setFormData] = useState({
    user: "",
    email: "",
    phone: "",
    preferredDate: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.user || !formData.email) {
      setError("Nom et email sont requis");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const cartData = {
        items: items.map((item) => ({
          dish: item.dish,
          quantity: item.quantity,
          servings: item.servings,
          adjustedPrice: item.adjustedPrice,
          adjustedTime: item.adjustedTime,
        })),
        totalPrice: grandTotal,
        totalItems: items.length,
      };

      const requestData = {
        user: formData.user,
        email: formData.email,
        date: formData.preferredDate || new Date().toISOString(),
        cart: {
          ...cartData,
          contact: {
            phone: formData.phone,
            message: formData.message,
          },
        },
      };

      const result = await apiService.createBatchCookingRequest(requestData);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.message || "Erreur lors de l'envoi de la demande");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError("Erreur lors de l'envoi de la demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Demande de Batch Cooking</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="cart-summary-modal">
            <h3>Résumé de votre panier</h3>
            <p>
              {items.length} plat{items.length > 1 ? "s" : ""} sélectionné
              {items.length > 1 ? "s" : ""}
            </p>
            <p>
              <strong>Total: {grandTotal.toFixed(2)}€</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="user">Nom complet *</label>
              <input
                type="text"
                id="user"
                name="user"
                value={formData.user}
                onChange={handleInputChange}
                required
                placeholder="Votre nom et prénom"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="votre@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Téléphone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="06 12 34 56 78"
              />
            </div>

            <div className="form-group">
              <label htmlFor="preferredDate">Date souhaitée</label>
              <input
                type="date"
                id="preferredDate"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message (optionnel)</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                placeholder="Informations complémentaires, allergies, préférences..."
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
