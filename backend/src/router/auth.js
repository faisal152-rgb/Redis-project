const express = require("express");
const userModel = require("../models/auth");
const { userRegister, userLogin, userLogout, userGetMe, refreshtoken, verifyOtp, forgotPassword, verifyForgotOtp, updateforgetPassword, resendOtp } = require("../controllers/auth");
const { authuser } = require("../middlewares/auth");



const router = express.Router();

/*
Auth Routes
*/
router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/logout", authuser, userLogout)
router.get("/get-me", authuser, userGetMe)
router.get("/refresh-token", authuser, refreshtoken)
router.post("/verify-otp", verifyOtp)
router.post("/forgot-password", forgotPassword)
router.post("/verify-forgot-otp", verifyForgotOtp)
router.post("/resend-otp", resendOtp)
router.patch("/update-forget-password", updateforgetPassword)




module.exports = router;
