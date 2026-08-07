const express = require("express");

const {
    addCategory,
} = require("../controllers/categoryController");

const protect = require("../middleware/authMiddleware");

const {
    adminOnly,
} = require("../middleware/roleMiddleware");

const router = express.Router();

// Create Category
router.post(
    "/",
    protect,
    adminOnly,
    addCategory
);

module.exports = router;