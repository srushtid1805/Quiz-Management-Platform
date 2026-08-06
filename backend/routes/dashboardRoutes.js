const express = require("express");

const {
    fetchDashboardStatistics,
} = require("../controllers/dashboardController");

const protect = require("../middleware/authMiddleware");

const {
    adminOnly,
} = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin Dashboard Statistics
router.get(
    "/",
    protect,
    adminOnly,
    fetchDashboardStatistics
);

module.exports = router;