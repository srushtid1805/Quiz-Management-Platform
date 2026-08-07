const pool = require("../config/db");

// Check whether a category exists
const findCategoryById = async (categoryId) => {
    const query = `
        SELECT id, name
        FROM categories
        WHERE id = $1
    `;

    const result = await pool.query(query, [categoryId]);

    return result.rows[0];
};

// Create a quiz
const createQuiz = async ({
    title,
    description,
    categoryId,
    difficulty,
    duration,
    passingScore,
    maxAttempts,
    status,
}) => {
    const query = `
        INSERT INTO quizzes (
            title,
            description,
            category_id,
            difficulty,
            duration,
            passing_score,
            max_attempts,
            status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;

    const values = [
        title,
        description,
        categoryId,
        difficulty,
        duration,
        passingScore,
        maxAttempts,
        status,
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

// Get all quizzes
const getAllQuizzes = async (search = "") => {
    const query = `
        SELECT
            q.id,
            q.title,
            q.description,
            q.category_id,
            c.name AS category_name,
            q.difficulty,
            q.duration,
            q.passing_score,
            q.max_attempts,
            q.status,
            q.created_at,
            q.updated_at
        FROM quizzes q
        LEFT JOIN categories c
            ON q.category_id = c.id
        WHERE q.title ILIKE $1
        ORDER BY q.created_at DESC
    `;

    const result = await pool.query(query, [`%${search}%`]);

    return result.rows;
};

// Get one quiz by ID
const getQuizById = async (id) => {
    const query = `
        SELECT
            q.id,
            q.title,
            q.description,
            q.category_id,
            c.name AS category_name,
            q.difficulty,
            q.duration,
            q.passing_score,
            q.max_attempts,
            q.status,
            q.created_at,
            q.updated_at
        FROM quizzes q
        LEFT JOIN categories c
            ON q.category_id = c.id
        WHERE q.id = $1
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
};

// Update quiz
const updateQuiz = async (
    id,
    {
        title,
        description,
        categoryId,
        difficulty,
        duration,
        passingScore,
        maxAttempts,
        status,
    }
) => {
    const query = `
        UPDATE quizzes
        SET
            title = $1,
            description = $2,
            category_id = $3,
            difficulty = $4,
            duration = $5,
            passing_score = $6,
            max_attempts = $7,
            status = $8,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *
    `;

    const values = [
        title,
        description,
        categoryId,
        difficulty,
        duration,
        passingScore,
        maxAttempts,
        status,
        id,
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

// Delete quiz
const deleteQuiz = async (id) => {
    const query = `
        DELETE FROM quizzes
        WHERE id = $1
        RETURNING *
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
};

const updateQuizPublishStatus = async (id, status) => {
    const query = `
        UPDATE quizzes
        SET
            status = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
    `;

    const result = await pool.query(query, [status, id]);

    return result.rows[0];
};

module.exports = {
    findCategoryById,
    createQuiz,
    getAllQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    updateQuizPublishStatus,
};