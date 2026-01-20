const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

// Simuler les fonctions de base de données pour Vercel
// En production, vous devriez utiliser une vraie base de données (MongoDB, PostgreSQL, etc.)
let database = {
  batchCookingRequests: [],
  users: []
};

const app = express();

// Hard-coded admin credentials
const ADMIN_CREDENTIALS = {
  username: "tyfer",
  password: "pussy",
};

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to verify JWT token
function verifyToken(token) {
  try {
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

  const user = database.users.find(u => u.email === decoded.email);
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
  res.json({ status: "OK", message: "BatchCook API is running on Vercel" });
});

// Route pour les menus disponibles
app.get("/menus", (req, res) => {
  const menus = [
    {
      id: 1,
      name: "Menu Famille",
      price: 149,
      description: "12 repas pour 2-4 personnes",
      items: ["Lasagnes bolognaise", "Curry de légumes", "Poisson grillé", "Riz pilaf"],
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
      items: ["Saumon teriyaki", "Bœuf bourguignon", "Risotto aux champignons", "Légumes grillés", "Couscous royal"],
    },
  ];

  res.json(menus);
});

// Routes pour batch cooking requests
app.post("/batch-cooking-requests", async (req, res) => {
  try {
    const newRequest = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    database.batchCookingRequests.push(newRequest);
    res.json({ success: true, request: newRequest });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.get("/batch-cooking-requests", async (req, res) => {
  try {
    res.json(database.batchCookingRequests);
  } catch (error) {
    console.error("Error fetching requests:", error);
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

    // Vérifier si l'email existe déjà
    const existingUser = database.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Un compte avec cet email existe déjà",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      phone: phone || null,
      createdAt: new Date().toISOString(),
    };

    database.users.push(user);

    const token = Buffer.from(`${user.email}:${user.id}`).toString("base64");

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
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

    const user = database.users.find(u => u.email === email);
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
    const requests = database.batchCookingRequests.filter(req => req.userId === req.user.id);
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
    const newRequest = {
      id: Date.now().toString(),
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      userPhone: req.user.phone,
      ...req.body,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    database.batchCookingRequests.push(newRequest);
    
    res.json({
      success: true,
      request: newRequest,
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

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
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
    const requests = database.batchCookingRequests;

    // Enrichir avec les données utilisateur
    const enrichedRequests = requests.map(request => {
      const user = database.users.find(u => u.id === request.userId);
      return {
        ...request,
        userPhone: user?.phone || request.userPhone
      };
    });

    const stats = {
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      confirmed: requests.filter((r) => r.status === "confirmed").length,
      completed: requests.filter((r) => r.status === "completed").length,
    };

    res.json({
      success: true,
      requests: enrichedRequests,
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

    const requestIndex = database.batchCookingRequests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Demande non trouvée",
      });
    }

    // Mettre à jour la demande
    database.batchCookingRequests[requestIndex] = {
      ...database.batchCookingRequests[requestIndex],
      status,
      notes,
      updatedAt: new Date().toISOString(),
    };

    console.log(`✅ Statut de la demande ${requestId} mis à jour: ${status}`);

    res.json({
      success: true,
      message: "Statut mis à jour avec succès",
      request: database.batchCookingRequests[requestIndex],
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

// Exporter pour Vercel
module.exports = app;