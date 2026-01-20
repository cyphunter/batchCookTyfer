import React, { useState } from "react";
import { apiService } from "../services/api";
import "./BatchCookingRequestModal.css";

interface CartItem {
  dish: {
    id: string;
    name: string;
    description?: string;
  };
  quantity: number;
  servings: number;
  adjustedPrice: number;
}

interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

interface BatchCookingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart;
  user?: any; // Utilisateur connecté
}

export default function BatchCookingRequestModal({
  isOpen,
  onClose,
  cart,
  user,
}: BatchCookingRequestModalProps) {
  const [formData, setFormData] = useState({
    date: "",
    message: "",
  });

  // Pas besoin de mettre à jour les données utilisateur car elles viennent directement de user
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const requestData = {
        user: user?.name || "Utilisateur inconnu",
        email: user?.email || "",
        date: formData.date,
        cart: {
          ...cart,
          contact: {
            message: formData.message,
          },
        },
      };

      console.log("Sending request data:", requestData);

      // Utiliser l'API utilisateur si connecté, sinon l'API générale
      const response = user
        ? await apiService.createUserBatchCookingRequest(requestData)
        : await apiService.createBatchCookingRequest(requestData);

      if (response.success) {
        setSubmitStatus("success");
        setTimeout(() => {
          onClose();
          setSubmitStatus("idle");
          setFormData({
            date: "",
            message: "",
          });
        }, 2000);
      } else {
        throw new Error(
          response.message || "Erreur lors de la création de la demande",
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  // Date minimum: aujourd'hui + 2 jours
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  const minDateString = minDate.toISOString().split("T")[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Demande de Batch Cooking</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="cart-summary">
            <div className="cart-items">
              {cart.items.map((item, index) => (
                <div key={index} className="cart-item-summary">
                  <span className="item-name">{item.dish.name}</span>
                  <span className="item-details">
                    {item.quantity}x • {item.servings} portions •{" "}
                    {item.adjustedPrice
                      ? parseFloat(String(item.adjustedPrice)).toFixed(2)
                      : "N/A"}
                    €
                  </span>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <strong>Total: {cart.totalPrice ? Number(cart.totalPrice).toFixed(2) : 'N/A'}€</strong>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="request-form">
            <div className="form-group">
              <label htmlFor="date">Date souhaitée *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                min={minDateString}
              />
              <small>Minimum 48h à l'avance</small>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message (optionnel)</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Précisions, allergies, contraintes particulières..."
                rows={4}
              />
            </div>

            {submitStatus === "success" && (
              <div className="success-message">
                ✅ Votre demande a été envoyée avec succès ! Nous vous
                recontacterons rapidement.
              </div>
            )}

            {submitStatus === "error" && (
              <div className="error-message">
                ❌ Erreur lors de l'envoi de votre demande. Veuillez réessayer.
              </div>
            )}

            <div className="form-actions">
              <button type="button" onClick={onClose} className="cancel-button">
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-button"
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
