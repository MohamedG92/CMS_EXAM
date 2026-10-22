const mongoose = require('mongoose');

// Connexion mise en cache : reutilisee entre les requetes (utile en serverless)
let connectionPromise = null;

function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return Promise.resolve(mongoose.connection);
    }
    if (!connectionPromise) {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!uri) {
            return Promise.reject(new Error('MONGODB_URI non definie dans le fichier .env'));
        }
        connectionPromise = mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 })
            .then((m) => {
                console.log('MongoDB connected successfully');
                return m.connection;
            })
            .catch((error) => {
                connectionPromise = null;
                throw error;
            });
    }
    return connectionPromise;
}

module.exports = connectDB;
