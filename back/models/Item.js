const mongoose = require('mongoose');

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
        // Identifiant envoye par le client : evite les doublons en cas de nouvelle tentative
        requestId: {
            type: String,
            unique: true,
            sparse: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);
