const {
    getDashboardStatistics,
} = require("../models/dashboardModel");

// Get Admin Dashboard Statistics
const fetchDashboardStatistics = async (req, res) => {
    try {

        const statistics = await getDashboardStatistics();

        return res.status(200).json({
            success: true,
            statistics,
        });

    } catch (error) {

        console.error(
            "Dashboard statistics error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }
};

module.exports = {
    fetchDashboardStatistics,
};