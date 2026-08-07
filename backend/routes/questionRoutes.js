const express = require("express");

const {
    addQuestion,
    fetchQuestionsByQuiz,
    editQuestion,
    removeQuestion,
} = require("../controllers/questionController");

const protect = require("../middleware/authMiddleware");

const {
    adminOnly,
} = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin: create question with options
router.post(
    "/quizzes/:quizId/questions",
    protect,
    adminOnly,
    addQuestion
);

router.get(
    "/quizzes/:quizId/questions",
    protect,
    adminOnly,
    fetchQuestionsByQuiz
);

router.put(
    "/questions/:id",
    protect,
    adminOnly,
    editQuestion
);

router.delete(
    "/questions/:id",
    protect,
    adminOnly,
    removeQuestion
);

module.exports = router;