const express = require("express");

const {
    fetchAttemptQuestions,
    saveAttemptProgress,
    submitQuizAttempt,
    autoSubmitExpiredAttempt,
    fetchAttemptResult,
    fetchStudentAttemptHistory,
} = require("../controllers/attemptController");

const protect = require("../middleware/authMiddleware");

const {
    studentOnly,
} = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/history",
    protect,
    studentOnly,
    fetchStudentAttemptHistory
);

router.get(
    "/:attemptId/questions",
    protect,
    studentOnly,
    fetchAttemptQuestions
);

router.put(
    "/:attemptId/progress",
    protect,
    studentOnly,
    saveAttemptProgress
);

router.post(
    "/:attemptId/submit",
    protect,
    studentOnly,
    submitQuizAttempt
);

router.post(
    "/:attemptId/auto-submit",
    protect,
    studentOnly,
    autoSubmitExpiredAttempt
);

router.get(
    "/:attemptId/result",
    protect,
    studentOnly,
    fetchAttemptResult
);

module.exports = router;