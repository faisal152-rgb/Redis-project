require("dotenv").config();
const userModel = require("../models/auth");
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser");
const sessionModel = require("../models/session");
const { sendEmail } = require("../services/EmailOtp")
const otpModel = require("../models/Otp")
const { generateOtp, getOtpHtml } = require("../utils/generateOtp")
const crypto = require("crypto");

/*
*_    Method Type: POST
*_    Route: /api/auth/register
*_    Description: Register a new user
*/

async function userRegister(req, res) {
    const { firstname, lastname, username, email, password, confirmPassword, role } = req.body;

    if (!firstname || !lastname || !username || !email || !password || !confirmPassword) {
        return res.status(400).json({
            message: "Please provide all the required fields",
            status: "Failed"
        })
    }
    if (password !== confirmPassword) {
        return res.status(400).json({
            message: "Password and confirm password do not match",
            status: "Failed"
        })
    }
    const existUser = await userModel.findOne({
        $or: [
            { email: email },
            { username: username }
        ]
    })

    if (existUser) {
        return res.status(400).json({
            message: "User already exists",
            status: "Failed"
        })
    }
    const user = await userModel.create(req.body);
    try {
        const otp = generateOtp();
        const html = getOtpHtml(otp);
        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
        const otpData = await otpModel.create({
            email: user.email,
            user: user._id,
            otpHash,
            expiresAt: Date.now() + 10 * 60 * 1000,
        })
        console.log(otp)
        await sendEmail(user.email, `OTP Verification ${otp}`, `Your OTP is ${otp}`, html);
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                email: user.email,
                role: user.role,
                verified: user.verified
            }
        })
    }

    catch (error) {
        console.log(error)
        await userModel.findByIdAndDelete(user._id)
        return res.status(500).json({
            message: "Internal server error",
            status: "Failed"
        })
    }
}
async function userLogin(req, res) {
    const { email, username, password } = req.body;
    const user = await userModel.findOne({
        $or: [
            { email: email },
            { username: username }
        ]
    }).select("+password")
    if (!user) {
        return res.status(404).json({
            message: "User not found",
            status: "Failed"
        })
    }
    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
        return res.status(401).json({
            message: "Invalid Password",
            status: "Failed"
        })
    }
    if (!user.verified) 
        try {
        const otp = generateOtp();
        const html = getOtpHtml(otp);
        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
        const otpData = await otpModel.create({
            email: user.email,
            user: user._id,
            otpHash,
            expiresAt: Date.now() + 10 * 60 * 1000,
        })
        await sendEmail(user.email, `OTP Verification ${otp}`, `Your OTP is ${otp}`, html);
        return res.status(200).json({
            message: "Please verify your email first",
            status: "Success",
            user: {
                email: user.email,
                verified: user.verified
            }
        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error",
            status: "Failed"
        })
    }
    const refreshtoken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const refreshTokenHash = crypto.createHash("sha256").update(refreshtoken).digest("hex");
    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"],

    })
    const accesstoken = jwt.sign({ id: user._id }, process.env.JWT_SECRET,
        {
            expiresIn: "15m"
        });

    res.cookie("refreshtoken", refreshtoken,
        {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }
    )

    return res.status(200).json({
        message: "Login successfully",
        user: {
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            role: user.role
        },
        accesstoken,
    })
}
async function userLogout(req, res) {
    const token = req.cookies.refreshtoken;
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    const refreshTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    });
    if (!session) {
        return res.status(401).json({
            message: "Unauthorized",
        })
    }
    session.revoked = true;
    await session.save();
    res.cookie("refreshtoken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 0,
    });
    return res.status(200).json({
        message: "Logout successfully",
        status: "Success"
    });
}

async function userGetMe(req, res) {
    const token = req.cookies.refreshtoken;
    const userId = req.user.id || req.user._id;
    const user = await userModel.findById(userId);
    if (!user) {
        return res.status(404).json({
            message: "User not found",
            status: "Failed"
        })
    }
    res.status(200).json({
        message: "User found successfully",
        user: {
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            role: user.role
        },
        refreshtoken: token,
    })
}
async function refreshtoken(req, res) {
    const refreshToken = req.cookies.refreshtoken;
    if (!refreshToken) {
        return res.status(401).json({
            message: "Unauthorized",
            status: "Failed"
        })
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    })
    if (!session) {
        return res.status(401).json({
            message: "Unauthorized",
            status: "Failed"
        })
    }
    session.revoked = true;
    await session.save();
    const accessToken = jwt.sign({
        id: decoded.id
    }, process.env.JWT_SECRET,
        {
            expiresIn: "15m"
        });
    const newRefreshToken = jwt.sign({
        id: decoded.id
    }, process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        });
    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    session.refreshTokenHash = newRefreshTokenHash;
    session.revoked = false;
    await session.save();
    res.cookie("refreshtoken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    res.status(200).json({
        message: "Token refreshed successfully",
        accessToken
    })

}
async function verifyOtp(req, res) {
    const { otp } = req.body;
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const otpData = await otpModel.findOne({
        otpHash,
        expiresAt: { $gt: Date.now() }
    })
    if (!otpData) {
        return res.status(404).json({
            message: "Otp not found",
            status: "Failed"
        })
    }
    const user = await userModel.findByIdAndUpdate(otpData.user, {
        verified: true
    },
        {
            new: true
        }
    )
    await otpModel.deleteMany({
        user: otpData.user
    })
    return res.status(200).json({
        message: "Otp verified successfully",
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            verified: user.verified
        }
    })
}
async function forgotPassword(req, res) {
    const { email } = req.body;
    const user = await userModel.findOne({ email })
    if (!user) {
        return res.status(400).json({
            message: "Email is not registered",
            status: "Failed"
        })
    }
    const otp = generateOtp();
    const html = getOtpHtml(otp);
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    await otpModel.deleteMany({
        email
    })
    const otpData = await otpModel.create({
        email,
        user: user._id,
        otpHash,
        expiresAt: Date.now() + 10 * 60 * 1000,
        revoked: false
    })
    await sendEmail(user.email, `Your OTP for password reset is: ${otp}`, `Your OTP is ${otp}`, html);
    if (!otpData) {
        return res.status(500).json({
            message: "Failed to send OTP",
            status: "Failed"
        })
    }

    return res.status(200).json({
        message: "Otp sent successfully",
        user: {
            _id: user._id,
            email: user.email,
            otpHash,
            expiresAt: Date.now() + 10 * 60 * 1000,
            revoked: false
        }
    })
}

async function verifyForgotOtp(req, res) {
    const { otp } = req.body;
    if (!otp) {
        return res.status(400).json({
            message: "OTP is required",
            status: "Failed"
        });
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const otpData = await otpModel.findOne({
        otpHash,
        expiresAt: { $gt: Date.now() }
    });

    if (!otpData) {
        return res.status(404).json({
            message: "OTP not found or expired",
        });
    }

    const user = await userModel.findById(otpData.user);
    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }

    user.verified = true;
    await user.save();

    await otpModel.deleteMany({
        user: user._id
    });

    const session = await sessionModel.create({
        user: user._id,
        type: "PASSWORD_RESET",
        ip: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "unknown"
    });

    return res.status(200).json({
        message: "OTP verified successfully",
        resetSessionId: session._id,
        sessionId: session._id,
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            verified: user.verified
        }
    });
}
async function resendOtp(req, res) {
    const { resetSessionId } = req.body;
    const session = await sessionModel.findOne({
        _id: resetSessionId,
        type: "PASSWORD_RESET"
    });
    if (!session) {
        return res.status(404).json({
            message: "Invalid or expired reset session",
            status: "Failed"
        });
    }
    const user = await userModel.findById(session.user);
    if (!user) {
        return res.status(404).json({
            message: "User not found",
            status: "Failed"
        });
    }
    const otp = generateOtp();
    const html = getOtpHtml(otp);
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    await otpModel.deleteMany({
        user: user._id
    });
    const otpData = await otpModel.create({
        email: user.email,
        user: user._id,
        otpHash,
        expiresAt: Date.now() + 10 * 60 * 1000,
        revoked: false
    })
    await sendEmail(user.email, `Your OTP for password reset is: ${otp}`, `Your OTP is ${otp}`, html);
    if (!otpData) {
        return res.status(500).json({
            message: "Failed to send OTP",
            status: "Failed"
        })
    }
    await sessionModel.deleteMany({
        user: user._id
    });
    await sessionModel.create({
        user: user._id,
        type: "PASSWORD_RESET",
        ip: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "unknown"
    });
    return res.status(200).json({
        message: "Otp resent successfully",
        resetSessionId: session._id,
        user: {
            _id: user._id,
            email: user.email,
            otpHash,
            expiresAt: Date.now() + 10 * 60 * 1000,
            revoked: false
        }
    })
}
async function updateforgetPassword(req, res) {
    const { resetSessionId, newpassword, confirmpassword } = req.body;

    if (newpassword !== confirmpassword) {
        return res.status(400).json({
            message: "Password and confirm password do not match",
        });
    }

    const session = await sessionModel.findOne({
        _id: resetSessionId,
        type: "PASSWORD_RESET"
    });

    if (!session) {
        return res.status(404).json({
            message: "Invalid or expired reset session",
            status: "Failed"
        });
    }

    const user = await userModel.findById(session.user);
    if (!user) {
        return res.status(404).json({
            message: "User not found",
            status: "Failed"
        });
    }

    const passwordhash =crypto.createHash("sha256").update(newpassword).digest("hex");
    user.password = passwordhash;
    await user.save();

    await sessionModel.findByIdAndDelete(session._id);

    return res.status(200).json({
        message: "Password updated successfully",
        status: "Success",
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            verified: user.verified
        }
    });
}

module.exports = {
    userRegister,
    userLogin,
    userLogout,
    userGetMe,
    refreshtoken,
    verifyOtp,
    forgotPassword,
    verifyForgotOtp,
    resendOtp,
    updateforgetPassword
}

