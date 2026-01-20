import React from "react";
import "./App.css";
import { CartProvider } from "./cart/context";
import { ToastProvider } from "./toast/context";
import { ServingsProvider } from "./servings/context";
import DishList from "./dish-list";
import CartView from "./cart-view";
import ShoppingListView from "./shopping-list-view";
import HomePage from "./HomePage";
import Admin from "./components/Admin";
import UserAuth from "./components/UserAuth";
import UserProfile from "./components/UserProfile";

export default function App() {
  const [currentView, setCurrentView] = React.useState<
    "home" | "menu" | "cart" | "shopping" | "admin" | "profile"
  >("home");

  const [user, setUser] = React.useState<any>(null);
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  // Vérifier si un utilisateur est connecté au chargement
  React.useEffect(() => {
    const userData = localStorage.getItem("userData");
    const token = localStorage.getItem("userToken");

    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Vérifier si c'est l'admin et rediriger vers la page admin
        if (
          parsedUser.isAdmin ||
          parsedUser.email === "tyfer@gmail.com" ||
          parsedUser.name.toLowerCase() === "tyfer"
        ) {
          setCurrentView("admin");
        }
      } catch (error) {
        console.error("Erreur parsing user data:", error);
        localStorage.removeItem("userData");
        localStorage.removeItem("userToken");
      }
    }
  }, []);

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setShowAuthModal(false);

    // Vérifier si c'est l'admin et rediriger vers la page admin
    if (
      userData.isAdmin ||
      userData.email === "tyfer@gmail.com" ||
      userData.name.toLowerCase() === "tyfer"
    ) {
      setCurrentView("admin");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("userToken");
    setCurrentView("home");
  };

  const requireAuth = (targetView: string) => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    setCurrentView(targetView as any);
    return true;
  };

  return (
    <ServingsProvider>
      <ToastProvider>
        <CartProvider>
          {currentView === "admin" ? (
            <Admin user={user} onLogout={handleLogout} />
          ) : currentView === "profile" && user && !user.isAdmin ? (
            <UserProfile
              user={user}
              onLogout={handleLogout}
              onBackToHome={() => setCurrentView("home")}
            />
          ) : currentView === "home" ? (
            <HomePage onGetStarted={() => setCurrentView("menu")} />
          ) : (
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
                  Service de batch cooking à domicile • Repas préparés avec
                  amour • Livraison hebdomadaire
                </p>
              </header>

              <nav className="nav">
                <button
                  className={currentView === "home" ? "active" : ""}
                  onClick={() => setCurrentView("home")}
                >
                  🏠 Accueil
                </button>
                <button
                  className={currentView === "menu" ? "active" : ""}
                  onClick={() => setCurrentView("menu")}
                >
                  🍽️ Menu
                </button>
                <button
                  className={currentView === "cart" ? "active" : ""}
                  onClick={() => requireAuth("cart")}
                >
                  🛒 Panier {!user && "🔒"}
                </button>
                <button
                  className={currentView === "shopping" ? "active" : ""}
                  onClick={() => requireAuth("shopping")}
                >
                  📋 Liste de courses {!user && "🔒"}
                </button>

                {/* Section authentification */}
                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {user ? (
                    <>
                      {!user.isAdmin && (
                        <button
                          className={currentView === "profile" ? "active" : ""}
                          onClick={() => setCurrentView("profile")}
                          style={{
                            background:
                              "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                            color: "white",
                            border: "none",
                          }}
                        >
                          👤 {user.name}
                        </button>
                      )}
                      {user.isAdmin && (
                        <button
                          className="active"
                          style={{
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            border: "none",
                          }}
                        >
                          🔐 Admin - {user.name}
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        style={{
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "var(--spacing-md) var(--spacing-lg)",
                          borderRadius: "var(--radius-md)",
                          cursor: "pointer",
                        }}
                      >
                        🚪 Déconnexion
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      style={{
                        background:
                          "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
                        color: "white",
                        border: "none",
                        padding: "var(--spacing-md) var(--spacing-lg)",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      🔐 Se connecter
                    </button>
                  )}
                </div>
              </nav>

              <main className="fade-in">
                {currentView === "menu" && <DishList />}
                {currentView === "cart" && user && <CartView user={user} />}
                {currentView === "shopping" && user && <ShoppingListView />}
              </main>
            </div>
          )}

          {/* Modal d'authentification */}
          {showAuthModal && (
            <UserAuth
              onAuthSuccess={handleAuthSuccess}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </CartProvider>
      </ToastProvider>
    </ServingsProvider>
  );
}
