const pool = require("../config/db");

// Find active attempt for student + quiz
const findActiveAttempt = async (userId, quizId) => {
    const query = `
        SELECT *
        FROM attempts
        WHERE user_id = $1
        AND quiz_id = $2
        AND status = 'IN_PROGRESS'
        ORDER BY started_at DESC
        LIMIT 1
    `;

    const result = await pool.query(query, [
        userId,
        quizId,
    ]);

    return result.rows[0];
};

// Count previous completed attempts
const countCompletedAttempts = async (
    userId,
    quizId
) => {
    const query = `
        SELECT COUNT(*) AS total
        FROM attempts
        WHERE user_id = $1
        AND quiz_id = $2
        AND status IN ('PASSED', 'FAILED')
    `;

    const result = await pool.query(query, [
        userId,
        quizId,
    ]);

    return Number(result.rows[0].total);
};

// Create new quiz attempt
const createAttempt = async (
    userId,
    quizId,
    duration
) => {
    const query = `
        INSERT INTO attempts (
            quiz_id,
            user_id,
            status,
            current_question,
            started_at,
            expires_at
        )
        VALUES (
            $1,
            $2,
            'IN_PROGRESS',
            0,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP + ($3 * INTERVAL '1 minute')
        )
        RETURNING *
    `;

    const result = await pool.query(query, [
        quizId,
        userId,
        duration,
    ]);

    return result.rows[0];
};

// Get questions safely for a student's active attempt
const getAttemptQuestions = async (attemptId, userId) => {
    // Verify attempt belongs to this student
    const attemptQuery = `
        SELECT *
        FROM attempts
        WHERE id = $1
        AND user_id = $2
        AND status = 'IN_PROGRESS'
    `;

    const attemptResult = await pool.query(
        attemptQuery,
        [attemptId, userId]
    );

    if (attemptResult.rows.length === 0) {
        return null;
    }

    const attempt = attemptResult.rows[0];

    // Get quiz questions
    const questionQuery = `
        SELECT
            q.id,
            q.question_text,
            q.marks,
            q.difficulty
        FROM questions q
        WHERE q.quiz_id = $1
        ORDER BY q.id ASC
    `;

    const questionResult = await pool.query(
        questionQuery,
        [attempt.quiz_id]
    );

    const questions = [];

    for (const question of questionResult.rows) {

        // Safe options - NO is_correct
        const optionQuery = `
            SELECT
                id,
                option_text
            FROM options
            WHERE question_id = $1
            ORDER BY id ASC
        `;

        const optionResult = await pool.query(
            optionQuery,
            [question.id]
        );

        // Find student's saved answer
        const answerQuery = `
            SELECT selected_option_id
            FROM answers
            WHERE attempt_id = $1
            AND question_id = $2
        `;

        const answerResult = await pool.query(
            answerQuery,
            [
                attemptId,
                question.id,
            ]
        );

        const selectedOptionId =
            answerResult.rows[0]?.selected_option_id || null;

        questions.push({
            ...question,
            options: optionResult.rows,
            selected_option_id: selectedOptionId,
        });
    }

    return {
        attempt,
        questions,
    };
};

// Check if an answer already exists
const findAnswer = async (
    attemptId,
    questionId
) => {
    const query = `
        SELECT *
        FROM answers
        WHERE attempt_id = $1
        AND question_id = $2
    `;

    const result = await pool.query(query, [
        attemptId,
        questionId,
    ]);

    return result.rows[0];
};

// Insert or update selected answer
const saveAnswer = async (
    attemptId,
    questionId,
    selectedOptionId
) => {
    const existingAnswer = await findAnswer(
        attemptId,
        questionId
    );

    if (existingAnswer) {
        const query = `
            UPDATE answers
            SET
                selected_option_id = $1,
                is_correct = NULL
            WHERE attempt_id = $2
            AND question_id = $3
            RETURNING *
        `;

        const result = await pool.query(query, [
            selectedOptionId,
            attemptId,
            questionId,
        ]);

        return result.rows[0];
    }

    const query = `
        INSERT INTO answers (
            attempt_id,
            question_id,
            selected_option_id,
            is_correct
        )
        VALUES ($1, $2, $3, NULL)
        RETURNING *
    `;

    const result = await pool.query(query, [
        attemptId,
        questionId,
        selectedOptionId,
    ]);

    return result.rows[0];
};

// Update student's current question position
const updateCurrentQuestion = async (
    attemptId,
    userId,
    currentQuestion
) => {
    const query = `
        UPDATE attempts
        SET current_question = $1
        WHERE id = $2
        AND user_id = $3
        AND status = 'IN_PROGRESS'
        RETURNING *
    `;

    const result = await pool.query(query, [
        currentQuestion,
        attemptId,
        userId,
    ]);

    return result.rows[0];
};

const getAttemptForSubmission = async (attemptId, userId) => {
    const query = `
        SELECT *
        FROM attempts
        WHERE id = $1
        AND user_id = $2
        AND status = 'IN_PROGRESS'
    `;

    const result = await pool.query(query, [
        attemptId,
        userId,
    ]);

    return result.rows[0];
};


const getQuestionsForScoring = async (quizId) => {
    const query = `
        SELECT
            q.id AS question_id,
            q.question_text,
            q.marks,
            q.explanation,
            o.id AS correct_option_id,
            o.option_text AS correct_answer
        FROM questions q
        JOIN options o
            ON o.question_id = q.id
        WHERE q.quiz_id = $1
        AND o.is_correct = true
        ORDER BY q.id ASC
    `;

    const result = await pool.query(query, [quizId]);

    return result.rows;
};


const getSavedAnswers = async (attemptId) => {
    const query = `
        SELECT
            id,
            question_id,
            selected_option_id
        FROM answers
        WHERE attempt_id = $1
    `;

    const result = await pool.query(query, [attemptId]);

    return result.rows;
};


const updateAnswerCorrectness = async (
    answerId,
    isCorrect
) => {
    const query = `
        UPDATE answers
        SET is_correct = $1
        WHERE id = $2
    `;

    await pool.query(query, [
        isCorrect,
        answerId,
    ]);
};


const completeAttempt = async (
    attemptId,
    {
        score,
        percentage,
        correctAnswers,
        incorrectAnswers,
        unanswered,
        timeTaken,
        status,
    }
) => {
    const query = `
        UPDATE attempts
        SET
            score = $1,
            percentage = $2,
            correct_answers = $3,
            incorrect_answers = $4,
            unanswered = $5,
            time_taken = $6,
            status = $7,
            completed_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
    `;

    const values = [
        score,
        percentage,
        correctAnswers,
        incorrectAnswers,
        unanswered,
        timeTaken,
        status,
        attemptId,
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

const getAttemptForAutoSubmission = async (
    attemptId,
    userId
) => {
    const query = `
        SELECT *
        FROM attempts
        WHERE id = $1
        AND user_id = $2
        AND status = 'IN_PROGRESS'
        AND expires_at <= CURRENT_TIMESTAMP
    `;

    const result = await pool.query(query, [
        attemptId,
        userId,
    ]);

    return result.rows[0];
};

// Get completed attempt
const getCompletedAttempt = async (attemptId, userId) => {
    const query = `
        SELECT
            a.*,
            q.title AS quiz_title,
            q.description AS quiz_description,
            q.passing_score
        FROM attempts a
        JOIN quizzes q
            ON a.quiz_id = q.id
        WHERE a.id = $1
        AND a.user_id = $2
        AND a.status IN ('PASSED', 'FAILED')
    `;

    const result = await pool.query(query, [
        attemptId,
        userId,
    ]);

    return result.rows[0];
};

// Get detailed answer review AFTER submission
const getAttemptResultAnswers = async (attemptId) => {
    const query = `
        SELECT
            q.id AS question_id,
            q.question_text,
            q.marks,
            q.explanation,

            a.selected_option_id,
            a.is_correct,

            selected.option_text AS selected_answer,

            correct.id AS correct_option_id,
            correct.option_text AS correct_answer

        FROM answers a

        JOIN questions q
            ON a.question_id = q.id

        LEFT JOIN options selected
            ON a.selected_option_id = selected.id

        LEFT JOIN options correct
            ON correct.question_id = q.id
            AND correct.is_correct = true

        WHERE a.attempt_id = $1

        ORDER BY q.id ASC
    `;

    const result = await pool.query(
        query,
        [attemptId]
    );

    return result.rows;
};

const getStudentAttemptHistory = async (userId) => {
    const query = `
        SELECT
            a.id AS attempt_id,
            a.quiz_id,
            q.title AS quiz_title,
            c.name AS category_name,
            q.difficulty,

            a.score,
            a.percentage,
            a.correct_answers,
            a.incorrect_answers,
            a.unanswered,
            a.time_taken,
            a.status,

            a.started_at,
            a.completed_at

        FROM attempts a

        JOIN quizzes q
            ON a.quiz_id = q.id

        LEFT JOIN categories c
            ON q.category_id = c.id

        WHERE a.user_id = $1
        AND a.status IN ('PASSED', 'FAILED')

        ORDER BY a.completed_at DESC
    `;

    const result = await pool.query(
        query,
        [userId]
    );

    return result.rows;
};

const getExpiredAttempts = async (userId) => {
    const query = `
        SELECT *
        FROM attempts
        WHERE user_id = $1
        AND status = 'IN_PROGRESS'
        AND expires_at <= CURRENT_TIMESTAMP
        ORDER BY expires_at ASC
    `;

    const result = await pool.query(
        query,
        [userId]
    );

    return result.rows;
};

module.exports = {
    findActiveAttempt,
    countCompletedAttempts,
    createAttempt,
    getAttemptQuestions,
    findAnswer,
    saveAnswer,
    updateCurrentQuestion,

    getAttemptForSubmission,
    getQuestionsForScoring,
    getSavedAnswers,
    updateAnswerCorrectness,
    completeAttempt,

    getAttemptForAutoSubmission,

    getCompletedAttempt,
    getAttemptResultAnswers,
    getStudentAttemptHistory,
    getExpiredAttempts,
};