const express = require("express");
const router = express.Router();
const { processPayment, VerifyPayment } = require("../controllers/payment");
const { authuser } = require("../middlewares/auth");


router.post("/process", authuser, processPayment);
router.post("/verify", authuser, VerifyPayment);


module.exports = router;