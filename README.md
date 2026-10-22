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
│   ├── config/db.js       # connexion Mongoose, schéma et modèle Item
│   ├── index.js           # serveur Express et routes
│   ├── package.json
│   └── .gitignore
├── front/
│   ├── index.html
│   ├── index.css
│   └── index.js           # URL du backend (API_URL) + appels API avec fetch()
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
```

Créer ensuite `back/.env` :

```
MONGODB_URI=mongodb+srv://<utilisateur>:<mot_de_passe>@<cluster>/<base>?retryWrites=true&w=majority
PORT=3000
```

## Commandes

Dans `back/` :

| Commande          | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm start`       | Démarre le serveur avec Node.js (production) |
| `npm run mohamed` | Démarre le serveur avec nodemon (développement) |

Frontend : ouvrir `front/index.html` avec un serveur statique (par ex. l'extension Live Server de VS Code sur le port 5500).

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

### Frontend sur Vercel

1. Importer le dépôt GitHub dans Vercel.
2. Root Directory : `front`, Framework Preset : `Other` (site statique, pas de build).

### Backend sur Vercel

1. Nouveau projet Vercel à partir du même dépôt, Root Directory : `back`.
2. `index.js` exporte l'app Express (`module.exports = app`).
3. Variables (Settings → Environment Variables) : `MONGODB_URI`, `NODE_ENV=production`, `ALLOWED_ORIGINS=<URL du frontend Vercel>`.
4. Tester : `https://<backend-vercel>/api/health`.

### Backend sur Railway

1. Nouveau projet Railway → Deploy from GitHub repo, Root Directory : `back`.
2. Railway lance `npm start`.
3. Variables (onglet Variables) : `MONGODB_URI`, `NODE_ENV=production`, `ALLOWED_ORIGINS=<URL du frontend Vercel>`. Ne pas définir `PORT` : Railway le fournit.
4. Générer un domaine public (Settings → Networking), vérifier les logs, puis tester `https://<backend-railway>/api/health`.

Les variables ne sont **pas** partagées entre Vercel et Railway : il faut les configurer sur chaque plateforme, avec la même `MONGODB_URI` pour que les deux backends affichent les mêmes données.

## Sécurité

- Aucun secret n'est commité : `.env`, `.env.*` et `node_modules` sont exclus par `back/.gitignore`.
- La règle réseau Atlas `0.0.0.0/0` est utilisée uniquement pour l'exercice : la retirer et changer le mot de passe de l'utilisateur après l'évaluation.
