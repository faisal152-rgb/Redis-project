const mongoose = require("mongoose");


const forgetpasswordSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email is not valid"],
        trim: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"]
    },
    newpassword: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
        min: [6, "Password must be at least 6 characters long"],
        max: [12, "Password must be at most 12 characters long"],
        select: false
    },
    confirmpassword: {
        type: String,
        required: [true, "ConfirmPassword is required"],
        trim: true,
        min: [6, "ConfirmPassword must be at least 6 characters long"],
        max: [12, "ConfirmPassword must be at most 12 characters long"],
        select: false
    },
},
    {
        timestamps: true
    })


    const forgetpasswordModel= mongoose.model("forgetpassword", forgetpasswordSchema);