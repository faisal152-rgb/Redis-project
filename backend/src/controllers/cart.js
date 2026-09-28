const express = require("express");
const cartModel = require("../models/cart");
const productModel = require("../models/product");
const userModel = require("../models/auth");

async function addToCart(req, res) {
    try {
        const { productId, quantity } = req.body;
        const user = req.user.id || req.user._id;
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                status: "Failed"
            })
        }
        const cart = await cartModel.create({
            user,
            product,
            quantity
        })
        return res.status(201).json({
            message: "Product added to cart successfully",
            status: "Success",
            cart
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error",
            status: "Failed"
        })
    }
}
async function getCart(req, res) {
    try {
        const user = req.user.id || req.user._id;
        const cart = await cartModel.find({ user }).populate("product");
        return res.status(200).json({
            message: "Cart fetched successfully",
            status: "Success",
            cart
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error",
            status: "Failed"
        })
    }
}
async function updateCart(req, res) {
    try {
        const { productId, quantity } = req.body;
        const user = req.user.id || req.user._id;
        const cart = await cartModel.findOneAndUpdate(
            { user, product: productId },
            { quantity },
            { new: true }
        )
        if (!cart) {
            return res.status(404).json({
                message: "Product not found in cart",
                status: "Failed"
            })
        }
        return res.status(200).json({
            message: "Cart updated successfully",
            status: "Success",
            cart
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error",
            status: "Failed"
        })
    }
}
async function removeFromCart(req, res) {
    try {
        const { productId } = req.body;
        const user = req.user.id || req.user._id;
        const cart = await cartModel.findOneAndDelete({
            user,
            product: productId
        })
        if (!cart) {
            return res.status(404).json({
                message: "Product not found in cart",
                status: "Failed"
            })
        }
        return res.status(200).json({
            message: "Product removed from cart successfully",
            status: "Success"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error",
            status: "Failed"
        })
    }
}

module.exports = {
    addToCart,
    getCart,
    updateCart,
    removeFromCart
};
