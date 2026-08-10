const express = require("express");

const {
    fetchStudentDashboard,
} = require("../controllers/studentDashboardController");

const protect = require("../middleware/authMiddleware");

const {
    studentOnly,
} = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    studentOnly,
    fetchStudentDashboard
);

module.exports = router;