import userModel from "../model/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js"
import sessionModel from "../model/session.model.js";
import bcrypt from "bcrypt";

export async function register(req, res) {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const isAlreadyR = await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    })

    if (isAlreadyR) {
        return res.status(409).json({ message: "user already exist" });
    }

    const hashPass = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hashPass,
    })

    const refreshToken = jwt.sign({
        id: user._id
    }, config.JWT_SECRET, {
        expiresIn: "7d",
    })

    const refreshTokenHash = crypto.createHash("sha256").update(refreshtoken).digest("hex")


    const sessionToken = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    })

    const accessToken = jwt.sign({
        id: user._id,
        sessionId: sessionToken._id,

    }, config.JWT_SECRET, {
        expiresIn: "15m"
    })



    res.cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
    })

    res.status(201).json({
        message: "user register successfully", user: {
            username: user.username,
            email: user.email,
        }, accessToken,
    })



}

export const login = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(401).json({ message: "user not found" })
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        return res.status(401).json({ message: "invalid email or password" })
    }

    const refreshToken = jwt.sign({
        id: user._id,
    }, config.JWT_SECRET, {
        expiresIn: "7d",
    })

    const refreshTokenHash = crypto.createHash("sha256").update(refreshtoken).digest("hex");

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    })

    const accessToken = jwt.sign({
        id: user._id,
        sessionId: session._id,
    }, config.JWT_SECRET, {
        expiresIn: "15m"
    })

    res.cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
        message: "login successfully",
        user: {
            username: user.username,
            email: user.email,
        }, accessToken
    })
}

export const getMe = async (req, res) => {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Token not found"
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }

    const user = await userModel.findById(decoded.id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.status(200).json({
        message: "User fetched successfully",
        user: {
            username: user.username,
            email: user.email
        }
    });
};

export const refreshToken = async (req, res) => {
    try {

        const refreshToken = req.cookies.refreshtoken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Unauthorized access"
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(
                refreshToken,
                config.JWT_SECRET
            );
        } catch (error) {
            return res.status(401).json({
                message: "Invalid or expired refresh token"
            });
        }

        const refreshTokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const session = await sessionModel.findOne({
            refreshTokenHash,
            revoked: false,
        });

        if (!session) {
            return res.status(401).json({
                message: "Invalid refresh token"
            });
        }

        // New Access Token
        const accessToken = jwt.sign(
            {
                id: decoded.id,
                sessionId: session._id,
            },
            config.JWT_SECRET,
            {
                expiresIn: "15m",
            }
        );

        // New Refresh Token (Token Rotation)
        const newRefreshToken = jwt.sign(
            {
                id: decoded.id,
            },
            config.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        const newRefreshTokenHash = crypto
            .createHash("sha256")
            .update(newRefreshToken)
            .digest("hex");

        session.refreshTokenHash = newRefreshTokenHash;

        await session.save();

        res.cookie("refreshtoken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const logOut = async (req, res) => {

    const refreshtoken = req.cookies.refreshtoken;

    if (!refreshtoken) {
        return res.status(400).json({ message: "token not found" })
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshtoken).digest("hex");

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false,
    })

    if (!session) {
        return res.status(400).json({ message: "invalid refresh token" })
    }

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshtoken");

    res.status(200).json({ message: "logged out successfully" })


}

export const logOutAll = async (req, res) => {
    try {

        const refreshToken = req.cookies.refreshtoken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Token not found"
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(
                refreshToken,
                config.JWT_SECRET
            );
        } catch (error) {
            return res.status(401).json({
                message: "Invalid refresh token"
            });
        }

        await sessionModel.updateMany(
            {
                user: decoded.id,
                revoked: false,
            },
            {
                revoked: true,
            }
        );

        res.clearCookie("refreshtoken");

        return res.status(200).json({
            message: "Logged out from all devices successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};