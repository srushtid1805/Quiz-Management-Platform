const express = require("express");

const {
    registerStudent,
    loginStudent,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const router = express.Router();

// Student registration
router.post("/register", registerStudent);

// Student login
router.post("/login", loginStudent);

// Protected Profile Route
router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Protected route accessed successfully",
        user: req.user,
    });
});

module.exports = router;