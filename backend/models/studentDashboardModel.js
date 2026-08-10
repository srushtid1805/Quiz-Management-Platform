const pool = require("../config/db");

const getStudentDashboardData = async (userId) => {
  const statisticsQuery = `
        SELECT
            COUNT(*) FILTER (
                WHERE status IN ('PASSED', 'FAILED')
            ) AS total_attempts,

            COUNT(*) FILTER (
                WHERE status = 'PASSED'
            ) AS passed_attempts,

            COUNT(*) FILTER (
                WHERE status = 'FAILED'
            ) AS failed_attempts,

           ROUND(
            COALESCE(
                    AVG(percentage) FILTER (
                        WHERE status IN ('PASSED', 'FAILED')
                    ),
                    0
                ),
                2
            ) AS average_score,

            COALESCE(
                MAX(percentage) FILTER (
                    WHERE status IN ('PASSED', 'FAILED')
                ),
                0
            ) AS highest_score

        FROM attempts
        WHERE user_id = $1
    `;

  const statisticsResult = await pool.query(statisticsQuery, [userId]);

  const activeAttemptsQuery = `
        SELECT
            a.id AS attempt_id,
            a.quiz_id,
            q.title AS quiz_title,
            q.duration,
            a.current_question,
            a.started_at,
            a.expires_at

        FROM attempts a

        JOIN quizzes q
            ON a.quiz_id = q.id

        WHERE a.user_id = $1
        AND a.status = 'IN_PROGRESS'
        AND a.expires_at > CURRENT_TIMESTAMP

        ORDER BY a.started_at DESC
    `;

  const activeAttemptsResult = await pool.query(activeAttemptsQuery, [userId]);

  const recentAttemptsQuery = `
        SELECT
            a.id AS attempt_id,
            a.quiz_id,
            q.title AS quiz_title,
            a.percentage,
            a.status,
            a.completed_at

        FROM attempts a

        JOIN quizzes q
            ON a.quiz_id = q.id

        WHERE a.user_id = $1
        AND a.status IN ('PASSED', 'FAILED')

        ORDER BY a.completed_at DESC

        LIMIT 5
    `;

  const recentAttemptsResult = await pool.query(recentAttemptsQuery, [userId]);

  const availableQuizzesQuery = `
    SELECT
        q.id,
        q.title,
        q.description,
        c.name AS category_name,
        q.difficulty,
        q.duration,
        q.passing_score,
        q.max_attempts,

        COUNT(a.id) FILTER (
            WHERE a.status IN ('PASSED', 'FAILED')
        ) AS attempts_used,

        GREATEST(
            q.max_attempts -
            COUNT(a.id) FILTER (
                WHERE a.status IN ('PASSED', 'FAILED')
            ),
            0
        ) AS attempts_remaining

    FROM quizzes q

    LEFT JOIN categories c
        ON q.category_id = c.id

    LEFT JOIN attempts a
        ON a.quiz_id = q.id
        AND a.user_id = $1

    WHERE q.status = 'PUBLISHED'

    GROUP BY
        q.id,
        q.title,
        q.description,
        c.name,
        q.difficulty,
        q.duration,
        q.passing_score,
        q.max_attempts,
        q.created_at

    ORDER BY q.created_at ASC
`;

  const availableQuizzesResult = await pool.query(availableQuizzesQuery, [
    userId
  ]);

  const availableQuizzes = availableQuizzesResult.rows.map((quiz) => ({
    ...quiz,
    attempts_used: Number(quiz.attempts_used),

    attempts_remaining: Number(quiz.attempts_remaining),

    can_attempt: Number(quiz.attempts_remaining) > 0
  }));

  return {
    statistics: statisticsResult.rows[0],
    activeAttempts: activeAttemptsResult.rows,
    recentAttempts: recentAttemptsResult.rows,
    availableQuizzes
  };
};

module.exports = {
  getStudentDashboardData
};
