const express = require("express");

const {
  fetchAllAttemptsForAdmin,
  fetchAttemptDetailsForAdmin,
} = require("../controllers/attemptController");

const protect = require("../middleware/authMiddleware");

const {
  adminOnly,
} = require("../middleware/roleMiddleware");

const router = express.Router();


// Get all completed student attempts
router.get(
  "/",
  protect,
  adminOnly,
  fetchAllAttemptsForAdmin
);


// Get one attempt with detailed result
router.get(
  "/:attemptId",
  protect,
  adminOnly,
  fetchAttemptDetailsForAdmin
);


module.exports = router;