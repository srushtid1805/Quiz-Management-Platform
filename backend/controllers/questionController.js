const {
    findQuizById,
    createQuestion,
    createOption,
    getQuestionsByQuizId,
    updateQuestion,
    deleteQuestion,
} = require("../models/questionModel");

// Create Question with Options
const addQuestion = async (req, res) => {
    try {
        const { quizId } = req.params;

        const {
            questionText,
            marks,
            explanation,
            difficulty,
            options,
        } = req.body;

        if (
            !questionText ||
            !marks ||
            !difficulty ||
            !options
        ) {
            return res.status(400).json({
                success: false,
                message: "Question text, marks, difficulty, and options are required",
            });
        }

        const quiz = await findQuizById(quizId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found",
            });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                success: false,
                message: "At least two options are required",
            });
        }

        const correctOptions = options.filter(
            (option) => option.isCorrect === true
        );

        if (correctOptions.length !== 1) {
            return res.status(400).json({
                success: false,
                message: "Exactly one option must be marked as correct",
            });
        }

        const question = await createQuestion({
            quizId,
            questionText,
            marks,
            explanation: explanation || null,
            difficulty,
        });

        const createdOptions = [];

        for (const option of options) {
            const createdOption = await createOption({
                questionId: question.id,
                optionText: option.optionText,
                isCorrect: option.isCorrect,
            });

            createdOptions.push(createdOption);
        }

        return res.status(201).json({
            success: true,
            message: "Question created successfully",
            question: {
                ...question,
                options: createdOptions,
            },
        });
    } catch (error) {
        console.error("Create question error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const fetchQuestionsByQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;

        const quiz = await findQuizById(quizId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found",
            });
        }

        const questions = await getQuestionsByQuizId(quizId);

        return res.status(200).json({
            success: true,
            count: questions.length,
            questions,
        });
    } catch (error) {
        console.error("Fetch questions error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Edit Question
const editQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            questionText,
            marks,
            explanation,
            difficulty,
        } = req.body;

        if (!questionText || !marks || !difficulty) {
            return res.status(400).json({
                success: false,
                message: "Question text, marks, and difficulty are required",
            });
        }

        const question = await updateQuestion(id, {
            questionText,
            marks,
            explanation: explanation || null,
            difficulty,
        });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Question updated successfully",
            question,
        });
    } catch (error) {
        console.error("Update question error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Delete Question
const removeQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const question = await deleteQuestion(id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Question deleted successfully",
        });
    } catch (error) {
        console.error("Delete question error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    addQuestion,
    fetchQuestionsByQuiz,
    editQuestion,
    removeQuestion,
};