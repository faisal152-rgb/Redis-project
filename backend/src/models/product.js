const mongoose = require("mongoose");
const { create } = require("./auth");

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        trim: true
    },
    imageUrl: {
        type: Object,
        required: [true, "Image is required"],
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        trim: true
    },
    stock:{
        type: Number,
        required: [true, "Stock is required"],
        trim: true
    },
    isActive:{
        type: Boolean,
        default: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },
    timestamp:{
        type: String,
        default: Date.now
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});


const productModel = mongoose.model("Product", productSchema);
module.exports = productModel;