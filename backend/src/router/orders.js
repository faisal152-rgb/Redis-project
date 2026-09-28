const express = require("express");
const router = express.Router();
const { createOrder, getOrder, updateOrder, deleteOrder } = require("../controllers/orders");
const { authuser } = require("../middlewares/auth");


router.post("/create", authuser, createOrder);
router.get("/all", authuser, getOrder);
router.put("/update/:id", authuser, updateOrder);
router.delete("/delete/:id", authuser, deleteOrder);

module.exports = router;