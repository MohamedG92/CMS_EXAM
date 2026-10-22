const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Elements de demonstration (remplaces par MongoDB a l'etape suivante)
const items = [
    { _id: "1", name: "Premier element", description: "Element de demonstration" },
    { _id: "2", name: "Deuxieme element", description: "Element de demonstration" }
];

app.get('/api/health', (req, res) => {
    res.json({ status: "ok", message: "Le serveur repond" });
});

app.get('/api/items', (req, res) => {
    res.json(items);
});

app.post('/api/items', (req, res) => {
    const { name, description } = req.body || {};
    if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({ error: "Le champ 'name' est obligatoire (2 caracteres minimum)" });
    }
    const item = {
        _id: String(items.length + 1),
        name: name.trim(),
        description: typeof description === "string" ? description.trim() : ""
    };
    items.push(item);
    res.status(201).json(item);
});

// Route inconnue
app.use((req, res) => {
    res.status(404).json({ error: "Route introuvable" });
});

// Erreurs (JSON invalide, erreurs serveur)
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "JSON invalide" });
    }
    console.error(err);
    res.status(500).json({ error: "Erreur interne du serveur" });
});

app.listen(PORT, () => {
    console.log("serveur fonctionne dans :" + PORT);
});
