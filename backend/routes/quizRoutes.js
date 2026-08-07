const express = require("express");

const {
    addQuiz,
    fetchAllQuizzes,
    fetchQuizById,
    editQuiz,
    removeQuiz,
    changeQuizPublishStatus,
} = require("../controllers/quizController");

const protect = require("../middleware/authMiddleware");

const {
    adminOnly,
} = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin: create quiz
router.post("/", protect, adminOnly, addQuiz);

// Admin: view all quizzes
router.get("/", protect, adminOnly, fetchAllQuizzes);

router.patch(
    "/:id/publish",
    protect,
    adminOnly,
    changeQuizPublishStatus
);

// Admin: update quiz
router.put("/:id", protect, adminOnly, editQuiz);

// Admin : Remove quiz
router.delete(
    "/:id",
    protect,
    adminOnly,
    removeQuiz
);

// Admin: view quiz by ID
router.get("/:id", protect, adminOnly, fetchQuizById);

module.exports = router;