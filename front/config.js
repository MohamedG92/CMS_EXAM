// Configuration unique du frontend (aucun secret ici).
// Modifier uniquement ce fichier pour changer les URL des backends.
window.APP_CONFIG = {
    // Backend principal (Railway) puis backend de secours (Vercel)
    PRIMARY_API_URL: "http://localhost:3000",
    FALLBACK_API_URL: "http://localhost:3000",
    // Delai maximal d'une requete avant de basculer (en millisecondes)
    TIMEOUT_MS: 5000
};
