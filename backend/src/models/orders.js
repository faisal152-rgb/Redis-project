const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            trim: true
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            trim: true
        },
        status: {
            type: String,
            enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
            default: "Pending"
        },
        orderDate: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }
    ],
    shippingAddress: [{
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        phone: {
            type: Number,
            required: [true, "Phone is required"],
            trim: true
        },
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true
        },
        addressLine: {
            type: String,
            trim: true
        }
    }],
    totalAmount: {
        type: Number,
        required: [true, "Total amount is required"],
        trim: true
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "JazzCash", "Easypaisa", "Bank Transfer"],
        default: "COD"
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Confirmed","Processing","Shipped","Delivered","Cancelled"],
        default: "Pending"
    },
    riskCheck: [{
        score:{
            type:Number,
            required:true,
            trim:true
        },
        level:{
            type:String,
            enum: ["Low","Medium","High"],
            default: "Low"
        },
        codAllowed:{
            type:Boolean,
            default: false
        },
        
    }],
    updatedAt: {
    type: Date,
    default: Date.now
},
    createdAt: {
    type: Date,
    default: Date.now
}
});

const orderModel = mongoose.model("Order", orderSchema);
module.exports = orderModel;