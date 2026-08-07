const pool = require("../config/db");

// Check quiz exists
const findQuizById = async (quizId) => {
    const query = `
        SELECT id, title
        FROM quizzes
        WHERE id = $1
    `;

    const result = await pool.query(query, [quizId]);

    return result.rows[0];
};


// Create question
const createQuestion = async ({
    quizId,
    questionText,
    marks,
    explanation,
    difficulty,
}) => {
    const query = `
        INSERT INTO questions (
            quiz_id,
            question_text,
            marks,
            explanation,
            difficulty
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    const values = [
        quizId,
        questionText,
        marks,
        explanation,
        difficulty,
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};


// Create option
const createOption = async ({
    questionId,
    optionText,
    isCorrect,
}) => {
    const query = `
        INSERT INTO options (
            question_id,
            option_text,
            is_correct
        )
        VALUES ($1, $2, $3)
        RETURNING *
    `;

    const values = [
        questionId,
        optionText,
        isCorrect,
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

// Get all questions for a quiz with their options
const getQuestionsByQuizId = async (quizId) => {
    const questionQuery = `
        SELECT
            id,
            quiz_id,
            question_text,
            marks,
            explanation,
            difficulty,
            created_at
        FROM questions
        WHERE quiz_id = $1
        ORDER BY id ASC
    `;

    const questionResult = await pool.query(
        questionQuery,
        [quizId]
    );

    const questions = questionResult.rows;

    for (const question of questions) {
        const optionQuery = `
            SELECT
                id,
                question_id,
                option_text,
                is_correct
            FROM options
            WHERE question_id = $1
            ORDER BY id ASC
        `;

        const optionResult = await pool.query(
            optionQuery,
            [question.id]
        );

        question.options = optionResult.rows;
    }

    return questions;
};

// Update question
const updateQuestion = async (
    id,
    {
        questionText,
        marks,
        explanation,
        difficulty,
    }
) => {
    const query = `
        UPDATE questions
        SET
            question_text = $1,
            marks = $2,
            explanation = $3,
            difficulty = $4
        WHERE id = $5
        RETURNING *
    `;

    const values = [
        questionText,
        marks,
        explanation,
        difficulty,
        id,
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};


// Delete question
const deleteQuestion = async (id) => {
    const query = `
        DELETE FROM questions
        WHERE id = $1
        RETURNING *
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
};

module.exports = {
    findQuizById,
    createQuestion,
    createOption,
    getQuestionsByQuizId,
    updateQuestion,
    deleteQuestion,
};