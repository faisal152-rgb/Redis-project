const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");


const authuser = async (req, res, next) => {
    const token = req.cookies.refreshtoken || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(404).json({
            message: "Unauthorized",
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(404).json({
            message: "Invalid token",
        });
    }
}

module.exports = {
    authuser,
};
