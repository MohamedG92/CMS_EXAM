const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();

const { connectDB, Item } = require('./config/db.js');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send("API MERN de Mohamed Iraqi - voir /api/health et /api/items");
});

app.get('/api', (req, res) => {
    res.json({
        message: "API MERN de Mohamed Iraqi",
        routes: ["GET /api/health", "GET /api/items", "POST /api/items"]
    });
});

app.get('/api/health', async (req, res) => {
    let database = "disconnected";
    try {
        await connectDB();
        await mongoose.connection.db.admin().ping();
        database = "connected";
    } catch (error) {
        console.error('MongoDB ping error:', error.message);
    }
    res.json({
        status: "ok",
        message: "Le serveur repond",
        database
    });
});

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
        const { name, description, requestId } = req.body || {};
        if (typeof name !== "string" || name.trim().length < 2) {
            return res.status(400).json({ error: "Le champ 'name' est obligatoire (2 caracteres minimum)" });
        }
        if (description !== undefined && typeof description !== "string") {
            return res.status(400).json({ error: "Le champ 'description' doit etre un texte" });
        }
        if (requestId !== undefined && (typeof requestId !== "string" || requestId.length > 100)) {
            return res.status(400).json({ error: "Le champ 'requestId' est invalide" });
        }

        if (requestId) {
            const existing = await Item.findOne({ requestId });
            if (existing) {
                return res.status(200).json(existing);
            }
        }

        const item = await Item.create({ name, description, requestId });
        res.status(201).json(item);
    } catch (error) {
        if (error.code === 11000 && req.body.requestId) {
            const existing = await Item.findOne({ requestId: req.body.requestId });
            if (existing) {
                return res.status(200).json(existing);
            }
        }
        next(error);
    }
});

app.use((req, res) => {
    res.status(404).json({ error: "Route introuvable" });
});

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
