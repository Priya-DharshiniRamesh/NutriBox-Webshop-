const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },

    customerName: {
        type: String,
        required: true
    },

    customerType: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    productName: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    pricePerUnit: {
        type: Number,
        required: true
    },

    totalAmount: {
        type: Number,
        required: true
    },

    orderStatus: {
        type: String,
        enum: [
            "Pending",
            "Confirmed",
            "Preparing",
            "Out for Delivery",
            "Delivered",
            "Cancelled"
        ],
        default: "Pending"
    },

    orderDate: {
        type: Date,
        default: Date.now
    },

    deliveryDate: {
        type: Date
    }
});

module.exports = mongoose.model("Order", orderSchema);