const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    },
    amount: {
        type: Number,
        required: true,
        trim: true
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "JazzCash", "Easypaisa", "Bank Transfer"],
        default: "COD",
        trim: true
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Success", "Failed"],
        default: "Pending"
    },
    transactionId: {
            type: String,
            trim: true
    },
    updatedAt: {
            type: Date,
            default: Date.now
    },
    createdAt: {
            type: Date,
            default: Date.now
        }
    });

const paymentModel = mongoose.model("Payment", paymentSchema);
module.exports = paymentModel;
