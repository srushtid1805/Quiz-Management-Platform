const bcrypt = require("bcrypt");

const { findAdminByEmail } = require("../models/adminModel");
const generateToken = require("../utils/generateToken");

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const admin = await findAdminByEmail(email);

        if (!admin) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        if (admin.status !== "ACTIVE") {
            return res.status(403).json({
                message: "Admin account is inactive",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            admin.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const token = generateToken(admin);

        return res.status(200).json({
            message: "Admin login successful",
            token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                status: admin.status,
            },
        });
    } catch (error) {
        console.error("Admin login error:", error);

        return res.status(500).json({
            message: "Failed to login admin",
        });
    }
};

module.exports = {
    adminLogin,
};