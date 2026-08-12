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
                SELECT ROUND(
                    COALESCE(AVG(percentage), 0),
                    2
                )
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

const getQuizPerformance = async () => {
  const query = `
    SELECT
      q.id AS quiz_id,
      q.title AS quiz_title,

      COUNT(a.id) FILTER (
        WHERE a.status IN ('PASSED', 'FAILED')
      ) AS total_attempts,

      ROUND(
        COALESCE(
          AVG(a.percentage) FILTER (
            WHERE a.status IN ('PASSED', 'FAILED')
          ),
          0
        ),
        2
      ) AS average_score,

      COUNT(a.id) FILTER (
        WHERE a.status = 'PASSED'
      ) AS passed_attempts,

      COUNT(a.id) FILTER (
        WHERE a.status = 'FAILED'
      ) AS failed_attempts

    FROM quizzes q

    LEFT JOIN attempts a
      ON a.quiz_id = q.id

    GROUP BY
      q.id,
      q.title

    ORDER BY average_score DESC
  `;

  const result = await pool.query(query);

  return result.rows;
};

const getCategoryPerformance = async () => {
  const query = `
    SELECT
      COALESCE(
        c.name,
        'Uncategorized'
      ) AS category_name,

      COUNT(a.id) FILTER (
        WHERE a.status IN ('PASSED', 'FAILED')
      ) AS total_attempts,

      ROUND(
        COALESCE(
          AVG(a.percentage) FILTER (
            WHERE a.status IN ('PASSED', 'FAILED')
          ),
          0
        ),
        2
      ) AS average_score

    FROM categories c

    LEFT JOIN quizzes q
      ON q.category_id = c.id

    LEFT JOIN attempts a
      ON a.quiz_id = q.id

    GROUP BY
      c.name

    ORDER BY average_score DESC
  `;

  const result = await pool.query(query);

  return result.rows;
};

module.exports = {
  getDashboardStatistics,
  getQuizPerformance,
  getCategoryPerformance
};
