const fs = require("fs").promises;
const path = require("path");

const DB_FILE = path.join(__dirname, "database.json");

// Initialise la base de données si elle n'existe pas
async function initDB() {
  try {
    await fs.access(DB_FILE);
  } catch (error) {
    // Le fichier n'existe pas, on le crée
    const initialData = {
      batchCookingRequests: [],
      users: [],
    };
    await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
    console.log("📁 Database initialized");
  }
}

// Lit la base de données
async function readDB() {
  try {
    const data = await fs.readFile(DB_FILE, "utf8");
    const db = JSON.parse(data);

    // S'assurer que la structure est complète
    if (!db.batchCookingRequests) {
      db.batchCookingRequests = [];
    }
    if (!db.users) {
      db.users = [];
    }

    return db;
  } catch (error) {
    console.error("Error reading database:", error);
    return { batchCookingRequests: [], users: [] };
  }
}

// Écrit dans la base de données
async function writeDB(data) {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing database:", error);
    throw error;
  }
}

// Ajoute une demande de batch cooking
async function addBatchCookingRequest(requestData) {
  const db = await readDB();

  const newRequest = {
    id: Date.now().toString(),
    ...requestData,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  db.batchCookingRequests.push(newRequest);
  await writeDB(db);

  return newRequest;
}

// Récupère toutes les demandes
async function getAllBatchCookingRequests() {
  const db = await readDB();
  return db.batchCookingRequests;
}

// Récupère une demande par ID
async function getBatchCookingRequestById(id) {
  const db = await readDB();
  return db.batchCookingRequests.find((req) => req.id === id);
}

// === GESTION DES UTILISATEURS ===

// Ajoute un utilisateur (inscription)
async function createUser(userData) {
  const db = await readDB();

  // S'assurer que users existe dans la base
  if (!db.users) {
    db.users = [];
  }

  // Vérifier si l'email existe déjà
  const existingUser = db.users.find((user) => user.email === userData.email);
  if (existingUser) {
    throw new Error("Un utilisateur avec cet email existe déjà");
  }

  const newUser = {
    id: Date.now().toString(),
    ...userData,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  await writeDB(db);

  return newUser;
}

// Récupère un utilisateur par email (connexion)
async function getUserByEmail(email) {
  const db = await readDB();
  return db.users.find((user) => user.email === email);
}

// Récupère un utilisateur par ID
async function getUserById(id) {
  const db = await readDB();
  return db.users.find((user) => user.id === id);
}

// Ajoute une demande de batch cooking pour un utilisateur connecté
async function addUserBatchCookingRequest(userId, requestData) {
  const db = await readDB();

  // Vérifier que l'utilisateur existe
  const user = db.users.find((user) => user.id === userId);
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  const newRequest = {
    id: Date.now().toString(),
    userId: userId,
    userEmail: user.email,
    userName: user.name,
    userPhone: user.phone,
    ...requestData,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  db.batchCookingRequests.push(newRequest);
  await writeDB(db);

  return newRequest;
}

// Récupère toutes les demandes d'un utilisateur
async function getUserBatchCookingRequests(userId) {
  const db = await readDB();
  return db.batchCookingRequests.filter((req) => req.userId === userId);
}

// Met à jour une demande de batch cooking
async function updateBatchCookingRequest(id, updates) {
  console.log(`🔄 [DATABASE] Mise à jour de la demande ${id} avec:`, updates);
  
  const db = await readDB();
  console.log(`📊 [DATABASE] Base de données lue, ${db.batchCookingRequests.length} demandes trouvées`);
  
  const requestIndex = db.batchCookingRequests.findIndex((req) => req.id === id);
  console.log(`🔍 [DATABASE] Index de la demande ${id}:`, requestIndex);
  
  if (requestIndex === -1) {
    console.log(`❌ [DATABASE] Demande ${id} non trouvée`);
    return null;
  }
  
  const originalRequest = { ...db.batchCookingRequests[requestIndex] };
  console.log(`📝 [DATABASE] Demande originale:`, { id: originalRequest.id, status: originalRequest.status });
  
  // Mettre à jour la demande avec les nouvelles données
  db.batchCookingRequests[requestIndex] = {
    ...db.batchCookingRequests[requestIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  console.log(`📝 [DATABASE] Demande après mise à jour:`, { 
    id: db.batchCookingRequests[requestIndex].id, 
    status: db.batchCookingRequests[requestIndex].status 
  });
  
  await writeDB(db);
  console.log(`💾 [DATABASE] Base de données sauvegardée`);
  
  return db.batchCookingRequests[requestIndex];
}

module.exports = {
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
};
