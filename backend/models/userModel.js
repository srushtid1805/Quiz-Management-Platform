const pool = require("../config/db");

// Get all students with optional search
const getAllStudents = async (search = "") => {
    const query = `
        SELECT
            id,
            name,
            email,
            role,
            status,
            created_at
        FROM users
        WHERE role = 'STUDENT'
        AND (
            name ILIKE $1
            OR email ILIKE $1
        )
        ORDER BY created_at DESC
    `;

    const values = [`%${search}%`];

    const result = await pool.query(query, values);

    return result.rows;
};

module.exports = {
    getAllStudents,
};