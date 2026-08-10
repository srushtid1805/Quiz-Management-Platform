const express = require("express");

const {
  fetchPublishedQuizzes,
  fetchPublishedQuizById
} = require("../controllers/quizController");

const { startQuizAttempt } = require("../controllers/attemptController");

const protect = require("../middleware/authMiddleware");

const { studentOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    studentOnly,
    fetchPublishedQuizzes
);

router.post(
    "/:quizId/start",
    protect,
    studentOnly,
    startQuizAttempt
);

router.get(
    "/:id",
    protect,
    studentOnly,
    fetchPublishedQuizById
);

module.exports = router;
