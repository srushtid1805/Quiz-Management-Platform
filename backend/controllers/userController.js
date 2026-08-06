const {
    getAllStudents,
    getStudentById,
    updateStudentStatus,
    deleteStudent,

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

// Get one student by ID
const fetchStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await getStudentById(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        return res.status(200).json({
            success: true,
            student,
        });
    } catch (error) {
        console.error("Fetch student by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Activate or deactivate student
const changeStudentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required",
            });
        }

        const normalizedStatus = status.trim().toUpperCase();

        if (!["ACTIVE", "INACTIVE"].includes(normalizedStatus)) {
            return res.status(400).json({
                success: false,
                message: "Status must be ACTIVE or INACTIVE",
            });
        }

        const student = await updateStudentStatus(
            id,
            normalizedStatus
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: `Student account changed to ${normalizedStatus}`,
            student,
        });
    } catch (error) {
        console.error("Update student status error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Delete student
const removeStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await deleteStudent(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student deleted successfully",
            student,
        });

    } catch (error) {
        console.error("Delete student error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    fetchAllStudents,
    fetchStudentById,
    changeStudentStatus,
    removeStudent,
};