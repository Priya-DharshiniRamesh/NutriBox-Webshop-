const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    unit: {
        type: String,
        required: true
    },

    available: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model("Product", productSchema);