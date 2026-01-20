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

// Helper function to verify JWT token
function verifyToken(token) {
  try {
    // Pour l'instant, on utilise une vérification simple basée sur l'email
    // Dans un vrai projet, utilisez JWT avec une clé secrète
    const decoded = Buffer.from(token, "base64").toString("ascii");
    const [email] = decoded.split(":");
    return { email };
  } catch (error) {
    return null;
  }
}

// Middleware d'authentification pour les utilisateurs
async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token manquant",
    });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Token invalide",
    });
  }

  // Récupérer l'utilisateur depuis la base
  const user = await getUserByEmail(decoded.email);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Utilisateur non trouvé",
    });
  }

  req.user = user;
  next();
}

// Middleware d'authentification admin
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token manquant",
    });
  }

  const token = authHeader.substring(7);

  try {
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

// Routes principales
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "BatchCook API is running" });
});

// Route pour les commandes
app.post("/orders", (req, res) => {
  const { formula, details } = req.body;

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
app.get("/menus", (req, res) => {
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
app.post("/appointments", (req, res) => {
  const { date, time, formula, contact } = req.body;

  const appointment = {
    id: Date.now(),
    date,
    time,
    formula,
    contact,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  console.log("Nouveau rendez-vous:", appointment);

  res.json({
    success: true,
    appointment,
    message: "Rendez-vous créé avec succès",
  });
});

// Routes pour batch cooking requests
app.post("/batch-cooking-requests", async (req, res) => {
  try {
    const request = await addBatchCookingRequest(req.body);
    res.json({ success: true, request });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.get("/batch-cooking-requests", async (req, res) => {
  try {
    const requests = await getAllBatchCookingRequests();
    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.get("/batch-cooking-requests/:id", async (req, res) => {
  try {
    const request = await getBatchCookingRequestById(req.params.id);
    if (request) {
      res.json(request);
    } else {
      res.status(404).json({ success: false, message: "Demande non trouvée" });
    }
  } catch (error) {
    console.error("Error fetching request:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Routes d'authentification
app.post("/auth/register", async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, mot de passe et nom sont requis",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      email,
      password: hashedPassword,
      name,
      phone: phone || null,
    });

    const token = Buffer.from(`${user.email}:${user.id}`).toString("base64");

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.message.includes("existe déjà")) {
      return res.status(400).json({
        success: false,
        message: "Un compte avec cet email existe déjà",
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription",
    });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe sont requis",
      });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    const token = Buffer.from(`${user.email}:${user.id}`).toString("base64");

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion",
    });
  }
});

app.get("/auth/profile", authenticateUser, async (req, res) => {
  try {
    const { password, ...userProfile } = req.user;
    res.json({
      success: true,
      user: userProfile,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil",
    });
  }
});

// Routes utilisateur protégées
app.get("/user/batch-cooking-requests", authenticateUser, async (req, res) => {
  try {
    const requests = await getUserBatchCookingRequests(req.user.id);
    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

app.post("/user/batch-cooking-requests", authenticateUser, async (req, res) => {
  try {
    const request = await addUserBatchCookingRequest(req.user.id, req.body);
    res.json({
      success: true,
      request,
      message: "Demande créée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la création de la demande:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la demande",
    });
  }
});

// Routes admin
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  ) {
    const token = Buffer.from(`${username}:admin`).toString("base64");
    res.json({
      success: true,
      token,
      message: "Connexion admin réussie",
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Identifiants incorrects",
    });
  }
});

app.get("/admin/batch-cooking-requests", authenticateAdmin, async (req, res) => {
  try {
    const requests = await getAllBatchCookingRequests();

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
    console.error("Erreur lors de la récupération des demandes admin:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

app.patch("/admin/batch-cooking-requests/:id", authenticateAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const requestId = req.params.id;

    const existingRequest = await getBatchCookingRequestById(requestId);
    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: "Demande non trouvée",
      });
    }

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
});

module.exports = app;