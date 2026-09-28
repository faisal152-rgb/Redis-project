const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");



const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        min: [3, "First name must be at least 3 characters long"],
        max: [30, "First name must be at most 30 characters long"]
    },
    lastname: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        min: [3, "Last name must be at least 3 characters long"],
        max: [30, "Last name must be at most 30 characters long"]
    },
    email: {
        type: String,
        required: [true, "Email Is Required"],
        lowercase: true,
        match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, "Email Is Not Valid"],
        trim: true,
        unique: true
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
        min: [6, "Password must be at least 6 characters long"],
        max: [12, "Password must be at most 12 characters long"],
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, "Confirm password is required"],
        trim: true,
        min: [6, "Confirm password must be at least 6 characters long"],
        max: [12, "Confirm password must be at most 12 characters long"],
        select: false
    },
    role: {
        type: String,
        enum: ["Admin", "Seller", "User"],
        default: "User"
    },
    timestamp: {

    },
    verified: {
        type: Boolean,
        default: false
    }
})


userSchema.pre("save", async function () {

    if (!this.isModified("password")) {
        return;
    }
    if (this.password !== this.confirmPassword) {
        throw new Error("Password and Confirm Password do not match");
    }
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash
    this.confirmPassword = undefined
    return;
})
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}


const userModel = mongoose.model("User", userSchema);


module.exports = userModel;




