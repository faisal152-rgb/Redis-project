const ordersModel = require("../models/orders");
const productModel = require("../models/product");
const userModel = require("../models/auth");
const { fetchOrdersRisk } = require("../services/ordersrisk");
const redis = require("../config/redis");

async function createOrder(req, res) {
    try {
        const userId = req.user.id || req.user._id;
        const { items, shippingAddress, totalAmount, paymentMethod, paymentStatus } = req.body;

        if (!items || !shippingAddress || !totalAmount) {
            return res.status(400).json({ message: "Items, shipping address, and total amount are required", status: "Failed" });
        }

        let currentPaymentMethod = paymentMethod || "COD";
        let riskScore = 0;
        let riskLevel = "Low";
        let codAllowed = true;

        try {
            // Call our new custom ordersrisk service
            const riskData = await fetchOrdersRisk({ userId, totalAmount, shippingAddress });
            riskScore = riskData.score || Math.floor(Math.random() * 100);
        } catch (error) {
            console.log("Risk check API failed, using Risk score");
            riskScore = Math.floor(Math.random() * 100);
        }

        // Risk check logic
        if (riskScore > 70) {
            riskLevel = "High";
            codAllowed = false;
            if (currentPaymentMethod === "COD") {
                return res.status(400).json({
                    message: "COD is not allowed for high-risk orders. Please choose a different payment method like JazzCash, Easypaisa, or Bank Transfer.",
                    status: "Failed"
                });
            }
        } else if (riskScore > 40) {
            riskLevel = "Medium";
            codAllowed = true;
        } else {
            riskLevel = "Low";
            codAllowed = true;
        }

        const riskCheck = [{
            score: riskScore,
            level: riskLevel,
            codAllowed
        }];


        // COD orders don't require payment processing — confirm immediately
        // Online payment methods (JazzCash, Easypaisa, Bank Transfer) stay "Pending" until payment is verified
        const orderPaymentStatus = currentPaymentMethod === "COD" ? "Confirmed" : "Pending";

        const newOrder = new ordersModel({
            userId,
            items,
            shippingAddress,
            totalAmount,
            paymentMethod: currentPaymentMethod,
            paymentStatus: orderPaymentStatus
        });
        await newOrder.save();
        return res.status(201).json({ message: "Order created successfully", status: "Success", order: newOrder });
    } catch (error) {
        console.log("Error creating order:", error);
        return res.status(500).json({ message: "Internal server error", status: "Failed" });
    }
}

async function getOrder(req, res) {
    try {
        const userId = req.user.id || req.user._id;
       
        const orders = await ordersModel.find({ userId }).populate("items.productId");

        return res.status(200).json({ message: "Orders fetched successfully", status: "Success", orders });
    } catch (error) {
        console.log("Error fetching orders:", error);
        return res.status(500).json({ message: "Internal server error", status: "Failed" });
    }
}

async function updateOrder(req, res) {
    try {
        const sellerId = req.user.id || req.user._id;
        const seller = await userModel.findById(sellerId);
        if (!seller || seller.role !== "seller") {
            return res.status(401).json({
                message: "Unauthorized",
                status: "Failed"
            })
        }
        const { id } = req.params;
        const { items, shippingAddress, totalAmount, paymentMethod, paymentStatus } = req.body;

        if (!items || !shippingAddress || !totalAmount) {
            return res.status(400).json({ message: "Items, shipping address, and total amount are required", status: "Failed" });
        }

        const order = await ordersModel.findByIdAndUpdate(id, { items, shippingAddress, totalAmount, paymentMethod, paymentStatus }, { new: true });

        if (!order) {
            return res.status(404).json({ message: "Order not found", status: "Failed" });
        }

        return res.status(200).json({ message: "Order updated successfully", status: "Success", order });
    } catch (error) {
        console.log("Error updating order:", error);
        return res.status(500).json({ message: "Internal server error", status: "Failed" });
    }
}

async function deleteOrder(req, res) {
    try {
        const sellerId = req.user.id || req.user._id;
        const seller = await userModel.findById(sellerId);
        if (!seller || seller.role !== "seller") {
            return res.status(401).json({
                message: "Unauthorized",
                status: "Failed"
            })
        }
        const { id } = req.params;

        const order = await ordersModel.findByIdAndDelete(id);

        if (!order) {
            return res.status(404).json({ message: "Order not found", status: "Failed" });
        }

        return res.status(200).json({ message: "Order deleted successfully", status: "Success", order });
    } catch (error) {
        console.log("Error deleting order:", error);
        return res.status(500).json({ message: "Internal server error", status: "Failed" });
    }
}

module.exports = {
    createOrder,
    getOrder,
    updateOrder,
    deleteOrder
};
