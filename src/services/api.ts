const API_BASE_URL = "http://localhost:3001/api";

// Helper pour récupérer le token d'authentification
function getAuthToken() {
  return localStorage.getItem("userToken");
}

// Helper pour les headers avec authentification
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export const apiService = {
  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error("Health check failed:", error);
      return { status: "ERROR", message: "Server unreachable" };
    }
  },

  // Récupérer les menus
  async getMenus() {
    try {
      const response = await fetch(`${API_BASE_URL}/menus`);
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch menus:", error);
      return [];
    }
  },

  // Créer une commande
  async createOrder(orderData: { formula: string; details: any }) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to create order:", error);
      return {
        success: false,
        message: "Erreur lors de la création de la commande",
      };
    }
  },

  // Créer un rendez-vous
  async createAppointment(appointmentData: {
    date: string;
    time: string;
    formula: string;
    contact: { name: string; email: string; phone: string };
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to create appointment:", error);
      return {
        success: false,
        message: "Erreur lors de la prise de rendez-vous",
      };
    }
  },

  // Créer une demande de batch cooking
  async createBatchCookingRequest(requestData: {
    user: string;
    email: string;
    date?: string;
    cart: any;
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/batch-cooking-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to create batch cooking request:", error);
      return {
        success: false,
        message: "Erreur lors de la création de la demande",
      };
    }
  },

  // Récupérer toutes les demandes de batch cooking
  async getBatchCookingRequests() {
    try {
      const response = await fetch(`${API_BASE_URL}/batch-cooking-requests`);
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch batch cooking requests:", error);
      return [];
    }
  },

  // Récupérer une demande spécifique
  async getBatchCookingRequest(id: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/batch-cooking-requests/${id}`,
      );
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch batch cooking request:", error);
      return null;
    }
  },

  // Admin: Authentification
  async adminLogin(credentials: { username: string; password: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to login:", error);
      return { success: false, message: "Erreur de connexion" };
    }
  },

  // Admin: Récupérer toutes les demandes
  async adminGetBatchCookingRequests(token: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/batch-cooking-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch admin requests:", error);
      return {
        success: false,
        message: "Erreur lors de la récupération des demandes",
      };
    }
  },

  // Admin: Mettre à jour le statut d'une demande
  async adminUpdateRequestStatus(
    token: string,
    requestId: string,
    updates: { status?: string; notes?: string },
  ) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/batch-cooking-requests/${requestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        },
      );
      return await response.json();
    } catch (error) {
      console.error("Failed to update request:", error);
      return { success: false, message: "Erreur lors de la mise à jour" };
    }
  },

  // === AUTHENTIFICATION UTILISATEUR ===

  // Inscription
  async register(userData: { email: string; password: string; name: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error("Registration failed:", error);
      return { success: false, message: "Erreur lors de l'inscription" };
    }
  },

  // Connexion
  async login(credentials: { email: string; password: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      return await response.json();
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: "Erreur lors de la connexion" };
    }
  },

  // Récupérer le profil utilisateur
  async getUserProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to get user profile:", error);
      return {
        success: false,
        message: "Erreur lors de la récupération du profil",
      };
    }
  },

  // Récupérer les demandes de l'utilisateur connecté
  async getUserBatchCookingRequests() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/user/batch-cooking-requests`,
        {
          headers: getAuthHeaders(),
        },
      );
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch user requests:", error);
      return {
        success: false,
        message: "Erreur lors de la récupération des demandes",
      };
    }
  },

  // Créer une demande de batch cooking (utilisateur connecté)
  async createUserBatchCookingRequest(requestData: any) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/user/batch-cooking-requests`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(requestData),
        },
      );
      return await response.json();
    } catch (error) {
      console.error("Failed to create user batch cooking request:", error);
      return {
        success: false,
        message: "Erreur lors de la création de la demande",
      };
    }
  },
};
