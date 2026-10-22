# mern-iraqi-mohamed

Petite application MERN : une API Node.js/Express connectée à MongoDB Atlas via Mongoose, et un frontend HTML/CSS/JavaScript natif qui affiche et ajoute des éléments.

## Objectif

- Lister les éléments enregistrés en base (`GET /api/items`)
- Ajouter un élément via un formulaire (`POST /api/items`)
- Vérifier l'état du serveur (`GET /api/health`)
- Déployer le frontend sur Vercel et le backend sur Vercel + Render

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
git clone https://github.com/MohamedG92/CMS_EXAM.git
cd CMS_EXAM/back
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

À définir dans `back/.env` en local, et dans les tableaux de bord Vercel / Render en production. Le fichier `.env` n'est jamais commité.

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
| Frontend (Vercel) | https://cmsexam-front.vercel.app |
| Backend Vercel    | https://mohamed-iraqi-cms.vercel.app/api/health |
| Backend Render    | _à compléter_ |

### Frontend sur Vercel

1. Importer le dépôt GitHub dans Vercel.
2. Root Directory : `front`, Framework Preset : `Other` (site statique, pas de build, aucune variable d'environnement).
3. L'URL du backend appelé est définie par `API_URL` en haut de `front/index.js`.

### Backend sur Vercel

1. Nouveau projet Vercel à partir du même dépôt, Root Directory : `back`.
2. `index.js` exporte l'app Express (`module.exports = app`).
3. Variables (Settings → Environment Variables) : `MONGODB_URI`, `NODE_ENV=production`, `ALLOWED_ORIGINS=https://cmsexam-front.vercel.app`.
4. Tester : `https://<backend-vercel>/api/health`.

### Backend sur Render

1. New + → Web Service → dépôt GitHub, Root Directory : `back`.
2. Runtime : Node, Build Command : `npm install`, Start Command : `npm start`.
3. Variables (Environment) : `MONGODB_URI`, `NODE_ENV=production`, `ALLOWED_ORIGINS=https://cmsexam-front.vercel.app`. Ne pas définir `PORT` : Render le fournit.
4. Health Check Path : `/api/health`. Vérifier les logs, puis tester `https://<backend-render>.onrender.com/api/health`.
5. Offre gratuite : le service se met en veille après 15 minutes sans trafic ; la première requête peut prendre jusqu'à une minute.

Les variables ne sont **pas** partagées entre Vercel et Render : il faut les configurer sur chaque plateforme, avec la même `MONGODB_URI` pour que les deux backends affichent les mêmes données.

## Sécurité

- Aucun secret n'est commité : `.env`, `.env.*` et `node_modules` sont exclus par `back/.gitignore`.
- La règle réseau Atlas `0.0.0.0/0` est utilisée uniquement pour l'exercice : la retirer et changer le mot de passe de l'utilisateur après l'évaluation.
