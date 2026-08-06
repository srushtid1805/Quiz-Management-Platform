const pool = require("../config/db");

// Get admin dashboard statistics
const getDashboardStatistics = async () => {
    const query = `
        SELECT
            (
                SELECT COUNT(*)
                FROM users
                WHERE role = 'STUDENT'
            ) AS total_students,

            (
                SELECT COUNT(*)
                FROM quizzes
            ) AS total_quizzes,

            (
                SELECT COUNT(*)
                FROM quizzes
                WHERE status = 'PUBLISHED'
            ) AS published_quizzes,

            (
                SELECT COUNT(*)
                FROM quizzes
                WHERE status = 'DRAFT'
            ) AS draft_quizzes,

            (
                SELECT COUNT(*)
                FROM questions
            ) AS total_questions,

            (
                SELECT COUNT(*)
                FROM attempts
            ) AS total_attempts,

            (
                SELECT COALESCE(AVG(percentage), 0)
                FROM attempts
            ) AS average_score,

            (
                SELECT COUNT(*)
                FROM attempts
                WHERE status = 'PASSED'
            ) AS passed_attempts,

            (
                SELECT COUNT(*)
                FROM attempts
                WHERE status = 'FAILED'
            ) AS failed_attempts
    `;

    const result = await pool.query(query);

    return result.rows[0];
};

module.exports = {
    getDashboardStatistics,
};