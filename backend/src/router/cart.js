const express = require("express");
const router = express.Router();
const { addToCart, getCart, updateCart, removeFromCart } = require("../controllers/cart");
const { authuser } = require("../middlewares/auth");


router.post("/add", authuser, addToCart);
router.get("/all", authuser, getCart);
router.put("/update/:id", authuser, updateCart);
router.delete("/delete/:id", authuser, removeFromCart);

module.exports = router;