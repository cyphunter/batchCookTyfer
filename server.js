const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const {
  initDB,
  addBatchCookingRequest,
  getAllBatchCookingRequests,
  getBatchCookingRequestById,
  updateBatchCookingRequest,
  createUser,
  getUserByEmail,
  getUserById,
  addUserBatchCookingRequest,
  getUserBatchCookingRequests,
} = require("./database");

const app = express();
const PORT = 3001;

// Hard-coded admin credentials
const ADMIN_CREDENTIALS = {
  username: "tyfer",
  password: "pussy",
};

// Initialize database
initDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "BatchCook API is running" });
});

// Route pour les commandes
app.post("/api/orders", (req, res) => {
  const { formula, details } = req.body;

  // Simulation d'une création de commande
  const order = {
    id: Date.now(),
    formula,
    details,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  console.log("Nouvelle commande reçue:", order);

  res.json({
    success: true,
    order,
    message: "Commande créée avec succès",
  });
});

// Route pour les menus disponibles
app.get("/api/menus", (req, res) => {
  const menus = [
    {
      id: 1,
      name: "Menu Famille",
      price: 149,
      description: "12 repas pour 2-4 personnes",
      items: [
        "Lasagnes bolognaise",
        "Curry de légumes",
        "Poisson grillé",
        "Riz pilaf",
      ],
    },
    {
      id: 2,
      name: "Menu Découverte",
      price: 89,
      description: "6 repas pour 2 personnes",
      items: ["Poulet rôti", "Ratatouille", "Quinoa aux légumes"],
    },
    {
      id: 3,
      name: "Menu Premium",
      price: 199,
      description: "16 repas pour 2-6 personnes",
      items: [
        "Saumon teriyaki",
        "Bœuf bourguignon",
        "Risotto aux champignons",
        "Légumes grillés",
        "Couscous royal",
      ],
    },
  ];

  res.json(menus);
});

// Route pour créer un rendez-vous
app.post("/api/appointments", (req, res) => {
  const { date, time, formula, contact } = req.body;

  const appointment = {
    id: Date.now(),
    date,
    time,
    formula,
    contact,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  console.log("Nouveau rendez-vous:", appointment);

  res.json({
    success: true,
    appointment,
    message: "Rendez-vous confirmé",
  });
});

// Fonction utilitaire pour générer un token simple
function generateToken(userId) {
  return Buffer.from(`user:${userId}:${Date.now()}`).toString("base64");
}

// Middleware d'authentification utilisateur
function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token d'authentification requis",
    });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = Buffer.from(token, "base64").toString("ascii");
    const [type, userId] = decoded.split(":");

    if (type === "user") {
      req.userId = userId;
      next();
    } else {
      res.status(403).json({
        success: false,
        message: "Token invalide",
      });
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token invalide",
    });
  }
}

// Routes d'authentification utilisateur
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Email, mot de passe, nom et téléphone requis",
      });
    }

    // Vérifier la force du mot de passe
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await createUser({
      email,
      password: hashedPassword,
      name,
      phone,
    });

    // Générer un token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: "Inscription réussie",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur inscription:", error);

    if (error.message.includes("existe déjà")) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'inscription",
      });
    }
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis",
      });
    }

    // Vérifier si c'est l'admin avec les credentials spéciaux
    if (
      (email === "tyfer@gmail.com" ||
        email.toLowerCase() === "tyfer@gmail.com") &&
      password === "pussy"
    ) {
      const token = generateToken("admin");
      return res.json({
        success: true,
        message: "Connexion admin réussie",
        user: {
          id: "admin",
          email: "tyfer@gmail.com",
          name: "tyfer",
          isAdmin: true,
          createdAt: new Date().toISOString(),
        },
        token,
      });
    }

    // Trouver l'utilisateur normal
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    // Générer un token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: "Connexion réussie",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur connexion:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion",
    });
  }
});

// Route pour récupérer le profil utilisateur
app.get("/api/auth/profile", authenticateUser, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Erreur récupération profil:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

// Route pour les demandes de l'utilisateur connecté
app.get(
  "/api/user/batch-cooking-requests",
  authenticateUser,
  async (req, res) => {
    try {
      const requests = await getUserBatchCookingRequests(req.userId);
      res.json({
        success: true,
        requests,
      });
    } catch (error) {
      console.error("Erreur récupération demandes utilisateur:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur",
      });
    }
  },
);

// Route pour créer une demande de batch cooking (utilisateur connecté)
app.post(
  "/api/user/batch-cooking-requests",
  authenticateUser,
  async (req, res) => {
    try {
      const requestData = req.body;
      const request = await addUserBatchCookingRequest(req.userId, requestData);

      console.log("Nouvelle demande de batch cooking utilisateur:", request);

      res.status(201).json({
        success: true,
        request,
        message: "Demande de batch cooking créée avec succès",
      });
    } catch (error) {
      console.error("Erreur création demande utilisateur:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création de la demande",
      });
    }
  },
);

// Routes pour les demandes de batch cooking
app.post("/api/batch-cooking-requests", async (req, res) => {
  try {
    const { user, email, date, cart } = req.body;

    if (!user || !email || !cart) {
      return res.status(400).json({
        success: false,
        message: "Données manquantes: user, email et cart sont requis",
      });
    }

    const request = await addBatchCookingRequest({
      user,
      email,
      date: date || new Date().toISOString(),
      cart,
    });

    console.log("Nouvelle demande de batch cooking:", request);

    res.json({
      success: true,
      request,
      message: "Demande de batch cooking enregistrée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la création de la demande:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création de la demande",
    });
  }
});

app.get("/api/batch-cooking-requests", async (req, res) => {
  try {
    const requests = await getAllBatchCookingRequests();
    res.json(requests);
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

app.get("/api/batch-cooking-requests/:id", async (req, res) => {
  try {
    const request = await getBatchCookingRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Demande non trouvée",
      });
    }
    res.json(request);
  } catch (error) {
    console.error("Erreur lors de la récupération de la demande:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

// Route d'authentification admin
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username et password requis",
    });
  }

  if (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  ) {
    // En production, utilisez un vrai JWT ou session
    const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

    res.json({
      success: true,
      message: "Authentification réussie",
      token,
      user: { username },
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Identifiants incorrects",
    });
  }
});

// Middleware d'authentification admin (basique)
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token d'authentification requis",
    });
  }

  const token = authHeader.substring(7);
  try {
    // Vérifier d'abord si c'est un token utilisateur pour l'admin tyfer
    try {
      const decoded = Buffer.from(token, "base64").toString("ascii");
      const [prefix, userId] = decoded.split(":");

      // Si c'est un token utilisateur avec userId 'admin', c'est notre admin tyfer
      if (prefix === "user" && userId === "admin") {
        req.admin = { username: "tyfer" };
        return next();
      }
    } catch (userTokenError) {
      // Ce n'est pas un token utilisateur valide, essayer l'ancien système admin
    }

    // Vérification basique du token (ancien système admin)
    const decoded = Buffer.from(token, "base64").toString("ascii");
    const [username] = decoded.split(":");

    if (username === ADMIN_CREDENTIALS.username) {
      req.admin = { username };
      next();
    } else {
      res.status(403).json({
        success: false,
        message: "Accès non autorisé",
      });
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token invalide",
    });
  }
}

// Routes admin protégées
app.get(
  "/api/admin/batch-cooking-requests",
  authenticateAdmin,
  async (req, res) => {
    try {
      const requests = await getAllBatchCookingRequests();

      // Ajouter des statistiques
      const stats = {
        total: requests.length,
        pending: requests.filter((r) => r.status === "pending").length,
        confirmed: requests.filter((r) => r.status === "confirmed").length,
        completed: requests.filter((r) => r.status === "completed").length,
      };

      res.json({
        success: true,
        requests,
        stats,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des demandes admin:",
        error,
      );
      res.status(500).json({
        success: false,
        message: "Erreur serveur",
      });
    }
  },
);

// Mettre à jour le statut d'une demande
app.patch(
  "/api/admin/batch-cooking-requests/:id",
  authenticateAdmin,
  async (req, res) => {
    try {
      const { status, notes } = req.body;
      const requestId = req.params.id;

      // Vérifier que la demande existe
      const existingRequest = await getBatchCookingRequestById(requestId);
      if (!existingRequest) {
        return res.status(404).json({
          success: false,
          message: "Demande non trouvée",
        });
      }

      // Mettre à jour la demande
      const updatedRequest = await updateBatchCookingRequest(requestId, {
        status,
        notes,
      });

      console.log(`✅ Statut de la demande ${requestId} mis à jour: ${status}`);

      res.json({
        success: true,
        message: "Statut mis à jour avec succès",
        request: updatedRequest,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur",
      });
    }
  },
);

app.listen(PORT, () => {
  console.log(`🚀 BatchCook API server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
