const {
    findCategoryById,
    createQuiz,
    getAllQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    updateQuizPublishStatus,
} = require("../models/quizModel");

// Create Quiz
const addQuiz = async (req, res) => {
    try {

        const {
            title,
            description,
            categoryId,
            difficulty,
            duration,
            passingScore,
            maxAttempts,
            status,
        } = req.body;

        // Validate required fields
        if (
            !title ||
            !description ||
            !categoryId ||
            !difficulty ||
            !duration ||
            !passingScore ||
            !maxAttempts ||
            !status
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check category exists
        const category = await findCategoryById(categoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        const quiz = await createQuiz({
            title,
            description,
            categoryId,
            difficulty,
            duration,
            passingScore,
            maxAttempts,
            status,
        });

        return res.status(201).json({
            success: true,
            message: "Quiz created successfully",
            quiz,
        });

    } catch (error) {

        console.error("Create quiz error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }
};

// Get All Quizzes
const fetchAllQuizzes = async (req, res) => {
    try {

        const search = req.query.search || "";

        const quizzes = await getAllQuizzes(search);

        return res.status(200).json({
            success: true,
            count: quizzes.length,
            quizzes,
        });

    } catch (error) {

        console.error("Fetch quizzes error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }
};

// Get Quiz By ID
const fetchQuizById = async (req, res) => {
    try {

        const { id } = req.params;

        const quiz = await getQuizById(id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found",
            });
        }

        return res.status(200).json({
            success: true,
            quiz,
        });

    } catch (error) {

        console.error("Fetch quiz error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }
};

// Update Quiz
const editQuiz = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            categoryId,
            difficulty,
            duration,
            passingScore,
            maxAttempts,
            status,
        } = req.body;

        if (
            !title ||
            !description ||
            !categoryId ||
            !difficulty ||
            !duration ||
            !passingScore ||
            !maxAttempts ||
            !status
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const existingQuiz = await getQuizById(id);

        if (!existingQuiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found",
            });
        }

        const category = await findCategoryById(categoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        const quiz = await updateQuiz(id, {
            title,
            description,
            categoryId,
            difficulty,
            duration,
            passingScore,
            maxAttempts,
            status,
        });

        return res.status(200).json({
            success: true,
            message: "Quiz updated successfully",
            quiz,
        });
    } catch (error) {
        console.error("Update quiz error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Delete Quiz
const removeQuiz = async (req, res) => {
    try {

        const { id } = req.params;

        const quiz = await deleteQuiz(id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Quiz deleted successfully",
        });

    } catch (error) {

        console.error("Delete quiz error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }
};

const changeQuizPublishStatus = async (req, res) => {
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

        if (!["PUBLISHED", "UNPUBLISHED"].includes(normalizedStatus)) {
            return res.status(400).json({
                success: false,
                message: "Status must be PUBLISHED or UNPUBLISHED",
            });
        }

        const existingQuiz = await getQuizById(id);

        if (!existingQuiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found",
            });
        }

        const quiz = await updateQuizPublishStatus(
            id,
            normalizedStatus
        );

        return res.status(200).json({
            success: true,
            message: `Quiz status changed to ${normalizedStatus}`,
            quiz,
        });
    } catch (error) {
        console.error("Change quiz status error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    addQuiz,
    fetchAllQuizzes,
    fetchQuizById,
    editQuiz,
    removeQuiz,
    changeQuizPublishStatus,
};