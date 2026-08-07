const {
    findCategoryByName,
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
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

// Get All Categories
const fetchAllCategories = async (req, res) => {
    try {
        const categories = await getAllCategories();

        return res.status(200).json({
            success: true,
            count: categories.length,
            categories,
        });
    } catch (error) {
        console.error("Fetch categories error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// Update Category
const editCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "Name and description are required",
            });
        }

        const existingCategory = await findCategoryByName(name);

        if (
            existingCategory &&
            Number(existingCategory.id) !== Number(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Category already exists",
            });
        }

        const category = await updateCategory(
            id,
            name,
            description
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category,
        });
    } catch (error) {
        console.error("Update category error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// Delete Category
const removeCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await deleteCategory(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
            category,
        });
    } catch (error) {
        console.error("Delete category error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    addCategory,
    fetchAllCategories,
    editCategory,
    removeCategory,
};