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

module.exports = {
    findCategoryByName,
    createCategory,
};