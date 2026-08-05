const pool = require("../config/db");

// Find a user using their email
const findUserByEmail = async (email) => {
    const query = `
        SELECT id, name, email, password, role, status, created_at
        FROM users
        WHERE email = $1
    `;

    const values = [email];

    const result = await pool.query(query, values);

    return result.rows[0];
};

// Create a new student account
const createStudent = async (name, email, hashedPassword) => {
    const query = `
        INSERT INTO users (name, email, password, role, status)
        VALUES ($1, $2, $3, 'STUDENT', 'ACTIVE')
        RETURNING id, name, email, role, status, created_at
    `;

    const values = [name, email, hashedPassword];

    const result = await pool.query(query, values);

    return result.rows[0];
};

module.exports = {
    findUserByEmail,
    createStudent,
};