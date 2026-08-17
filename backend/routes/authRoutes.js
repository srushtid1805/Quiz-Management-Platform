const express = require("express");

const {
  registerStudent,
  loginStudent,
  getStudentProfile,
  updateAvatar,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const { adminOnly, studentOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

// Student registration
router.post("/register", registerStudent);

// Student login
router.post("/login", loginStudent);

// Protected Profile Route
router.get("/profile", protect, getStudentProfile);

// Admin Only Route
router.get("/admin-test", protect, adminOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Admin!"
  });
});

// Student Only Route
router.get("/student-test", protect, studentOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Student!"
  });
});

// for avtar
router.put(
    "/profile/avatar",
    protect,
    studentOnly,
    updateAvatar
);

module.exports = router;
