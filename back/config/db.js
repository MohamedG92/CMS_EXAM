const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const itemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Le champ 'name' est obligatoire"],
            trim: true,
            minlength: [2, "Le champ 'name' doit contenir au moins 2 caracteres"],
            maxlength: [100, "Le champ 'name' ne doit pas depasser 100 caracteres"]
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Le champ 'description' ne doit pas depasser 500 caracteres"],
            default: ""
        },
        requestId: {
            type: String,
            unique: true,
            sparse: true
        }
    },
    { timestamps: true }
);

const Item = mongoose.model('Item', itemSchema);

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

module.exports = { connectDB, Item };
