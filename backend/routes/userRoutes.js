const express = require("express");

const {
    fetchAllStudents,
    fetchStudentById,
    changeStudentStatus,
    removeStudent,
    
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

const {
    adminOnly,
} = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin: view all students
router.get("/", protect, adminOnly, fetchAllStudents);

// Admin: activate or deactivate student
router.patch(
    "/:id/status",
    protect,
    adminOnly,
    changeStudentStatus
);

router.get("/:id", protect, adminOnly, fetchStudentById);

router.delete(
    "/:id",
    protect,
    adminOnly,
    removeStudent
);

module.exports = router;