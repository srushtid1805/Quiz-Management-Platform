const {
    getStudentDashboardData,
} = require("../models/studentDashboardModel");

const finalizeExpiredAttempts =
    require("../utils/finalizeExpiredAttempts");

const fetchStudentDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Finalize any expired attempts first
        await finalizeExpiredAttempts(userId);

        // Then calculate fresh dashboard data
        const dashboard =
            await getStudentDashboardData(userId);

        return res.status(200).json({
            success: true,
            ...dashboard,
        });

    } catch (error) {
        console.error(
            "Fetch student dashboard error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    fetchStudentDashboard,
};