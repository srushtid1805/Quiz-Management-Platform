const {
    getAllStudents,
} = require("../models/userModel");

// Get all students
const fetchAllStudents = async (req, res) => {
    try {
        const search = req.query.search || "";

        const students = await getAllStudents(search);

        return res.status(200).json({
            success: true,
            count: students.length,
            students,
        });
    } catch (error) {
        console.error("Fetch students error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    fetchAllStudents,
};