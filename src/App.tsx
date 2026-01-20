import React from "react";
import "./App.css";
import { CartProvider } from "./cart/context";
import { ToastProvider } from "./toast/context";
import { ServingsProvider } from "./servings/context";
import DishList from "./dish-list";
import CartView from "./cart-view";
import ShoppingListView from "./shopping-list-view";

export default function App() {
  const [currentView, setCurrentView] = React.useState<
    "menu" | "cart" | "shopping"
  >("menu");

  return (
    <ServingsProvider>
      <ToastProvider>
        <CartProvider>
          <div className="container">
            <header
              style={{
                textAlign: "center",
                marginBottom: "var(--spacing-2xl)",
                padding: "var(--spacing-xl) 0",
              }}
            >
              <h1
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "var(--spacing-md)",
                }}
              >
                🍳 BatchCook Premium
              </h1>
              <p
                style={{
                  fontSize: "1.1rem",
                  color: "var(--text-secondary)",
                  maxWidth: "600px",
                  margin: "0 auto",
                  lineHeight: "1.6",
                }}
              >
                Service de batch cooking à domicile • Repas préparés avec amour
                • Livraison hebdomadaire
              </p>
            </header>

            <nav className="nav">
              <button
                className={currentView === "menu" ? "active" : ""}
                onClick={() => setCurrentView("menu")}
              >
                🍽️ Menu
              </button>
              <button
                className={currentView === "cart" ? "active" : ""}
                onClick={() => setCurrentView("cart")}
              >
                🛒 Panier
              </button>
              <button
                className={currentView === "shopping" ? "active" : ""}
                onClick={() => setCurrentView("shopping")}
              >
                📋 Liste de courses
              </button>
            </nav>

            <main className="fade-in">
              {currentView === "menu" && <DishList />}
              {currentView === "cart" && <CartView />}
              {currentView === "shopping" && <ShoppingListView />}
            </main>
          </div>
        </CartProvider>
      </ToastProvider>
    </ServingsProvider>
  );
}
