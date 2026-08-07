const {
    findCategoryByName,
    createCategory,
} = require("../models/categoryModel");

// Create Category
const addCategory = async (req, res) => {
    try {

        const { name, description } = req.body;

        // Validation
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "Name and description are required",
            });
        }

        // Check duplicate category
        const existingCategory =
            await findCategoryByName(name);

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category already exists",
            });
        }

        const category = await createCategory(
            name,
            description
        );

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            category,
        });

    } catch (error) {

        console.error(
            "Create category error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }
};

module.exports = {
    addCategory,
};