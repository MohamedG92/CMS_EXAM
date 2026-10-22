# mern-iraqi-mohamed

Petite application MERN : une API Node.js/Express connectée à MongoDB Atlas via Mongoose, et un frontend HTML/CSS/JavaScript natif qui affiche et ajoute des éléments.

## Objectif

- Lister les éléments enregistrés en base (`GET /api/items`)
- Ajouter un élément via un formulaire (`POST /api/items`)
- Vérifier l'état du serveur (`GET /api/health`)
- Déployer le frontend sur Vercel et le backend sur Vercel + Railway

## Structure

```
mern-iraqi-mohamed/
├── back/
│   ├── config/db.js       # connexion Mongoose
│   ├── models/Item.js     # schéma et modèle Mongoose
│   ├── index.js           # serveur Express et routes
│   ├── package.json
│   └── .env.example       # variables d'environnement (valeurs fictives)
├── front/
│   ├── index.html
│   ├── index.css
│   ├── index.js           # appels API avec fetch()
│   └── config.js          # URL du backend (configuration unique)
├── .gitignore
└── README.md
```

## Prérequis

- Node.js 18 ou plus récent
- npm
- Un cluster MongoDB Atlas (base de test) et un utilisateur de base de données

## Installation

```bash
git clone <URL_DU_DEPOT_GITHUB>
cd mern-iraqi-mohamed/back
npm install
cp .env.example .env   # puis remplir les vraies valeurs dans .env
```

## Commandes

Dans `back/` :

| Commande          | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm start`       | Démarre le serveur avec Node.js (production) |
| `npm run mohamed` | Démarre le serveur avec nodemon (développement) |

Frontend : ouvrir `front/index.html` avec un serveur statique (par ex. l'extension Live Server de VS Code sur le port 5500). L'URL du backend se règle dans `front/config.js`.

## Variables d'environnement

À définir dans `back/.env` en local, et dans les tableaux de bord Vercel / Railway en production. Le fichier `.env` n'est jamais commité.

| Variable          | Obligatoire | Description                                                           |
| ----------------- | ----------- | --------------------------------------------------------------------- |
| `MONGODB_URI`     | oui         | URI de connexion MongoDB Atlas                                        |
| `PORT`            | non         | Port d'écoute (3000 par défaut, fourni par la plateforme en production) |
| `NODE_ENV`        | non         | `development` ou `production`                                         |
| `ALLOWED_ORIGINS` | non         | Origines frontend autorisées par CORS, séparées par des virgules      |

## Routes API

| Méthode | Route         | Description                    | Réponses                     |
| ------- | ------------- | ------------------------------ | ---------------------------- |
| GET     | `/api/health` | Vérifie que le serveur répond  | 200                          |
| GET     | `/api/items`  | Liste les éléments en base     | 200, 503 (base indisponible) |
| POST    | `/api/items`  | Crée un élément                | 201, 400 (validation), 503   |

Corps attendu pour `POST /api/items` :

```json
{ "name": "Livre", "description": "Optionnel" }
```

`name` est obligatoire (2 à 100 caractères), `description` est optionnelle (500 caractères max).

## Déploiement

| Service           | URL          |
| ----------------- | ------------ |
| Frontend (Vercel) | _à compléter_ |
| Backend Vercel    | _à compléter_ |
| Backend Railway   | _à compléter_ |

## Sécurité

- Aucun secret n'est commité : `.env` et `.env.*` sont exclus par `.gitignore` (seul `.env.example` est versionné).
- La règle réseau Atlas `0.0.0.0/0` est utilisée uniquement pour l'exercice : la retirer et changer le mot de passe de l'utilisateur après l'évaluation.
