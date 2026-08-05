const express = require("express");

const {
    fetchAllStudents,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

const {
    adminOnly,
} = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin: view all students
router.get("/", protect, adminOnly, fetchAllStudents);

module.exports = router;