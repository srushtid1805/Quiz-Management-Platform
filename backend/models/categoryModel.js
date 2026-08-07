const pool = require("../config/db");

// Find category by name
const findCategoryByName = async (name) => {
    const query = `
        SELECT id, name, description, created_at
        FROM categories
        WHERE LOWER(name) = LOWER($1)
    `;

    const result = await pool.query(query, [name]);

    return result.rows[0];
};

// Create category
const createCategory = async (name, description) => {
    const query = `
        INSERT INTO categories (name, description)
        VALUES ($1, $2)
        RETURNING id, name, description, created_at
    `;

    const result = await pool.query(query, [
        name,
        description,
    ]);

    return result.rows[0];
};

// Get all categories
const getAllCategories = async () => {
    const query = `
        SELECT
            id,
            name,
            description,
            created_at
        FROM categories
        ORDER BY created_at DESC
    `;

    const result = await pool.query(query);

    return result.rows;
};


// Update category
const updateCategory = async (id, name, description) => {
    const query = `
        UPDATE categories
        SET
            name = $1,
            description = $2
        WHERE id = $3
        RETURNING
            id,
            name,
            description,
            created_at
    `;

    const result = await pool.query(query, [
        name,
        description,
        id,
    ]);

    return result.rows[0];
};


// Delete category
const deleteCategory = async (id) => {
    const query = `
        DELETE FROM categories
        WHERE id = $1
        RETURNING
            id,
            name,
            description
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
};

module.exports = {
    findCategoryByName,
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
};