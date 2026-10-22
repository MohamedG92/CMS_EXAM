const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db.js');
const Item = require('./models/Item.js');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS : seules les origines de ALLOWED_ORIGINS sont autorisees (toutes si la variable est vide)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({
        status: "ok",
        message: "Le serveur repond",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
});

// Les routes /api/items ont besoin de la base : on attend la connexion
app.use('/api/items', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        res.status(503).json({ error: "Base de donnees indisponible" });
    }
});

app.get('/api/items', async (req, res, next) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        next(error);
    }
});

app.post('/api/items', async (req, res, next) => {
    try {
        const { name, description } = req.body || {};
        if (typeof name !== "string" || name.trim().length < 2) {
            return res.status(400).json({ error: "Le champ 'name' est obligatoire (2 caracteres minimum)" });
        }
        if (description !== undefined && typeof description !== "string") {
            return res.status(400).json({ error: "Le champ 'description' doit etre un texte" });
        }
        const item = await Item.create({ name, description });
        res.status(201).json(item);
    } catch (error) {
        next(error);
    }
});

// Route inconnue
app.use((req, res) => {
    res.status(404).json({ error: "Route introuvable" });
});

// Erreurs (JSON invalide, validation Mongoose, erreurs serveur)
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "JSON invalide" });
    }
    if (err instanceof mongoose.Error.ValidationError) {
        const message = Object.values(err.errors).map((e) => e.message).join(", ");
        return res.status(400).json({ error: message });
    }
    console.error(err);
    res.status(500).json({ error: "Erreur interne du serveur" });
});

// Lancement direct (local, Railway) : connexion a MongoDB avant de demarrer le serveur.
// Sur Vercel, le fichier est importe comme fonction : on exporte simplement l'app.
if (require.main === module) {
    connectDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log("serveur fonctionne dans :" + PORT);
            });
        })
        .catch((error) => {
            console.error('MongoDB connection error:', error.message);
            process.exit(1);
        });
}

module.exports = app;
