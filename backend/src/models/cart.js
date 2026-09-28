const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    items:[{
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
    
    quantity:{
        type: Number,
        required: [true, "Quantity is required"],
        trim: true
    },
    price:{
        type: Number,
        required: [true, "Price is required"],
        trim: true
    }
    }],
    totalAmount:{
        type: Number,
        required: [true, "Total amount is required"],
        trim: true
    },
    updatedAt:{
        type: Date,
        default: Date.now
    }
});

const cartModel = mongoose.model("Cart", cartSchema);
module.exports = cartModel;