const crypto = require("crypto");
const orderModel = require("../models/orders");
const userModel = require("../models/auth");
const paymentModel = require("../models/payments");
const { JazzcashService, EasypaisaService, BankTransferService } = require("../services/paymentservices");

async function processPayment(req, res) {
    try {
        const { orderId, paymentDetails } = req.body;
        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
                status: "Failed"
            });
        }

        // Prepare data for Jazzcash checkout
        const paymentData = {
            pp_Amount: order.totalAmount * 100, // typically in paisas
            pp_BillReference: order._id.toString(),
            pp_Description: `Payment for Order ${orderId}`,
            ...paymentDetails // allow frontend to pass any other required jazzcash parameters
        };

        // Dynamically select the payment service based on the order
        let PaymentProvider = JazzcashService; // Default
        if (order.paymentMethod === "Easypaisa") {
            PaymentProvider = EasypaisaService;
        } else if (order.paymentMethod === "Bank Transfer") {
            PaymentProvider = BankTransferService;
        }

        // Call the selected payment service
        const response = await new Promise((resolve) => {
            PaymentProvider.pay(paymentData, (responseObj) => {
                resolve(responseObj);
            });
        });

        // The transaction ID usually comes in the response (e.g., pp_TxnRefNo or pp_RetreivalReferenceNumber)
        const transactionId = response.pp_TxnRefNo || response.pp_RetreivalReferenceNumber || `TXN_${Date.now()}`;

        const payment = await paymentModel.create({
            order: order._id,
            user: order.userId,
            amount: order.totalAmount,
            currency: "PKR",
            status: response.pp_ResponseCode === '000' ? "Completed" : "Pending",
            paymentMethod: order.paymentMethod,
            transactionId: transactionId,
        });

        return res.status(201).json({
            message: "Payment processed successfully",
            status: "Success",
            payment,
            gatewayResponse: response
        });
    } catch (error) {
        console.error("Payment processing error:", error);
        return res.status(500).json({ message: "Internal server error", status: "Failed" });
    }
}

async function VerifyPayment(req, res) {
    try {
        const { orderId, paymentId } = req.body;
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                message: "Order not found",
                status: "Failed"
            });
        }

        const payment = await paymentModel.findById(paymentId);
        if (!payment) {
            return res.status(404).json({
                message: "Payment not found",
                status: "Failed"
            });
        }

        const inquiryData = {
            pp_TxnRefNo: payment.transactionId
        };

        // Dynamically select the payment service based on the order
        let PaymentProvider = JazzcashService; // Default
        if (order.paymentMethod === "Easypaisa") {
            PaymentProvider = EasypaisaService;
        } else if (order.paymentMethod === "Bank Transfer") {
            PaymentProvider = BankTransferService;
        }

        // Call the selected payment inquiry service
        const response = await new Promise((resolve) => {
            PaymentProvider.inquiry(inquiryData, (responseObj) => {
                resolve(responseObj);
            });
        });

        // Check if response indicates success (000 is usually success)
        const isSuccess = response.pp_ResponseCode === '000';

        if (!isSuccess) {
            payment.status = "Failed";
            await payment.save();
            return res.status(401).json({
                message: "Payment Verification Failed",
                status: "Failed",
                gatewayResponse: response
            });
        }

        payment.status = "Success";
        await payment.save();

        // Update the order's payment status as well
        order.paymentStatus = "Confirmed";
        await order.save();

        return res.status(200).json({
            message: "Payment verified successfully",
            status: "Success",
            payment,
            gatewayResponse: response
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        return res.status(500).json({ message: "Internal server error", status: "Failed" });
    }
}

module.exports = {
    processPayment,
    VerifyPayment
};
