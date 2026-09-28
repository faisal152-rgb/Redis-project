const express = require("express");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db.js");
const authRouter = require("./router/auth.js");
const cookieParser = require("cookie-parser");
const { connectimagekit } = require("./services/storage.js");
const productsRouter = require("./router/products.js");
const cartRouter = require("./router/cart.js");
const ordersRouter = require("./router/orders.js");
const paymentRouter = require("./router/payment.js");


const app = express();
app.use(express.json());
app.use(cookieParser());
connectDB();
connectimagekit();



/*
Routes
*/
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payment", paymentRouter);









module.exports = app;