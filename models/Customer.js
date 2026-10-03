const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    organizationName: {
        type: String,
        required: true
    },

    customerType: {
        type: String,
        required: true
    },

    contactPerson: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Customer", customerSchema);