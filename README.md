# mern-iraqi-mohamed

Petite application MERN : une API Node.js/Express connectée à MongoDB Atlas via Mongoose, et un frontend HTML/CSS/JavaScript natif qui affiche et ajoute des éléments.

## Objectif

- Lister les éléments enregistrés en base (`GET /api/items`)
- Ajouter un élément via un formulaire (`POST /api/items`)
- Vérifier l'état du serveur (`GET /api/health`)
- Déployer le frontend sur Vercel et le backend sur Vercel + un serveur Ubuntu personnel

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

À définir dans `back/.env` en local, et dans les tableau de bord Vercel / sur le serveur en production. Le fichier `.env` n'est jamais commité.

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
| Backend serveur   | https://velaria-cosmetics.duckdns.org/cms-api/api/health |

### Frontend sur Vercel

1. Importer le dépôt GitHub dans Vercel.
2. Root Directory : `front`, Framework Preset : `Other` (site statique, pas de build, aucune variable d'environnement).
3. L'URL du backend appelé est définie par `API_URL` en haut de `front/index.js`.

### Backend sur Vercel

1. Nouveau projet Vercel à partir du même dépôt, Root Directory : `back`.
2. `index.js` exporte l'app Express (`module.exports = app`).
3. Variables (Settings → Environment Variables) : `MONGODB_URI`, `NODE_ENV=production`, `ALLOWED_ORIGINS=https://cmsexam-front.vercel.app`.
4. Tester : `https://<backend-vercel>/api/health`.

### Backend sur un serveur Ubuntu (Docker + Apache)

Remplace Railway/Render : le même code backend tourne sur un serveur Ubuntu personnel.

1. Cloner le dépôt sur le serveur : `git clone https://github.com/MohamedG92/CMS_EXAM.git ~/cms-exam`.
2. Créer `~/cms-exam/back/.env` avec `MONGODB_URI` (`chmod 600`, jamais commité).
3. Lancer le backend dans un conteneur Node, redémarré automatiquement :

   ```bash
   docker run -d --name cms-exam-back --restart unless-stopped \
     -v "$HOME/cms-exam/back:/app" -w /app \
     -e PORT=3005 -e NODE_ENV=production -e ALLOWED_ORIGINS=https://cmsexam-front.vercel.app \
     -p 127.0.0.1:3005:3005 \
     node:22-alpine sh -c "npm ci --omit=dev && npm start"
   ```

4. Apache (HTTPS, certificat Let's Encrypt) redirige `/cms-api/` vers le conteneur :

   ```
   ProxyPass /cms-api/ http://127.0.0.1:3005/
   ProxyPassReverse /cms-api/ http://127.0.0.1:3005/
   ```

   (`sudo a2enmod proxy proxy_http`, `sudo a2enconf cms-api`, `sudo systemctl reload apache2`)
5. Vérifier les logs (`docker logs cms-exam-back`) puis tester `https://velaria-cosmetics.duckdns.org/cms-api/api/health`.
6. Mise à jour : `cd ~/cms-exam && git pull && docker restart cms-exam-back`.

Les variables ne sont **pas** partagées entre Vercel et le serveur : elles sont configurées séparément sur chaque plateforme, avec la même `MONGODB_URI` pour que les deux backends affichent les mêmes données.

## Sécurité

- Aucun secret n'est commité : `.env`, `.env.*` et `node_modules` sont exclus par `back/.gitignore`.
- La règle réseau Atlas `0.0.0.0/0` est utilisée uniquement pour l'exercice : la retirer et changer le mot de passe de l'utilisateur après l'évaluation.
