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

// Get student by ID
const getStudentById = async (id) => {
    const query = `
        SELECT
            id,
            name,
            email,
            role,
            status,
            created_at
        FROM users
        WHERE id = $1
        AND role = 'STUDENT'
    `;

    const values = [id];

    const result = await pool.query(query, values);

    return result.rows[0];
};

// Update student account status
const updateStudentStatus = async (id, status) => {
    const query = `
        UPDATE users
        SET status = $1
        WHERE id = $2
        AND role = 'STUDENT'
        RETURNING
            id,
            name,
            email,
            role,
            status,
            created_at
    `;

    const values = [status, id];

    const result = await pool.query(query, values);

    return result.rows[0];
};

// Delete student
const deleteStudent = async (id) => {
    const query = `
        DELETE FROM users
        WHERE id = $1
        AND role = 'STUDENT'
        RETURNING
            id,
            name,
            email
    `;

    const values = [id];

    const result = await pool.query(query, values);

    return result.rows[0];
};

const findUserById = async (id) => {
    const query = `
        SELECT
            id,
            name,
            email,
            role,
            status,
            avatar
        FROM users
        WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
};

const updateStudentAvatar = async (id, avatar) => {
    const query = `
        UPDATE users
        SET avatar = $1
        WHERE id = $2
        AND role = 'STUDENT'
        RETURNING
            id,
            name,
            email,
            role,
            status,
            avatar
    `;

    const result = await pool.query(
        query,
        [avatar, id]
    );

    return result.rows[0];
};

module.exports = {
    getAllStudents,
    getStudentById,
    updateStudentStatus,
    deleteStudent,
    findUserById,
    updateStudentAvatar,
};