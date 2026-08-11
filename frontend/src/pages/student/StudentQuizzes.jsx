import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import StudentLayout from "../../components/StudentLayout";
import api from "../../services/api";

const StudentQuizzes = () => {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [activeAttempts, setActiveAttempts] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token =
          localStorage.getItem("studentToken");

        const response = await api.get(
          "/student/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setQuizzes(
          response.data.availableQuizzes || []
        );

        setActiveAttempts(
          response.data.activeAttempts || []
        );

      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load quizzes"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter(
    (quiz) => {
      const keyword =
        search.trim().toLowerCase();

      if (!keyword) return true;

      return (
        quiz.title
          ?.toLowerCase()
          .includes(keyword) ||
        quiz.category_name
          ?.toLowerCase()
          .includes(keyword) ||
        quiz.difficulty
          ?.toLowerCase()
          .includes(keyword)
      );
    }
  );

  const getActiveAttempt = (quizId) => {
    return activeAttempts.find(
      (attempt) =>
        Number(attempt.quiz_id) ===
        Number(quizId)
    );
  };

  if (loading) {
    return (
      <StudentLayout>
        <p>Loading quizzes...</p>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="student-error-box">
          {error}
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="student-quizzes-page">

        {/* HEADER */}
        <div className="student-page-header">
          <div>
            <h1>My Quizzes</h1>

            <p>
              Explore available quizzes and
              continue your learning.
            </p>
          </div>

          <div className="student-quiz-count">
            {quizzes.length} Quizzes
          </div>
        </div>

        {/* SEARCH */}
        <div className="student-search-wrapper">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search quizzes by title, category or difficulty..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {/* QUIZZES */}
        {filteredQuizzes.length === 0 ? (
          <div className="student-empty-state">
            <h3>No quizzes found</h3>

            <p>
              Try searching with another keyword.
            </p>
          </div>
        ) : (
          <div className="student-quizzes-grid">
            {filteredQuizzes.map((quiz) => {
              const activeAttempt =
                getActiveAttempt(quiz.id);

              return (
                <div
                  key={quiz.id}
                  className="student-full-quiz-card"
                >
                  {/* QUIZ HEADER */}
                  <div className="student-quiz-card-top">
                    <div className="student-quiz-icon">
                      {getQuizIcon(
                        quiz.category_name
                      )}
                    </div>

                    <div>
                      <span className="student-category-badge">
                        {quiz.category_name}
                      </span>

                      <h2>{quiz.title}</h2>
                    </div>
                  </div>

                  <p className="student-quiz-description">
                    {quiz.description}
                  </p>

                  {/* INFO */}
                  <div className="student-quiz-meta">
                    <span>
                      🎯 {quiz.difficulty}
                    </span>

                    <span>
                      ⏱ {quiz.duration} min
                    </span>

                    <span>
                      ✅ Pass:{" "}
                      {quiz.passing_score}%
                    </span>
                  </div>

                  {/* ATTEMPTS */}
                  <div className="student-attempt-progress">
                    <div className="student-attempt-row">
                      <span>
                        Attempts Used
                      </span>

                      <strong>
                        {quiz.attempts_used}/
                        {quiz.max_attempts}
                      </strong>
                    </div>

                    <div className="student-progress-track">
                      <div
                        className="student-progress-fill"
                        style={{
                          width: `${Math.min(
                            100,
                            quiz.max_attempts > 0
                              ? (quiz.attempts_used /
                                  quiz.max_attempts) *
                                  100
                              : 0
                          )}%`
                        }}
                      />
                    </div>

                    <small>
                      {quiz.attempts_remaining}{" "}
                      attempt
                      {quiz.attempts_remaining === 1
                        ? ""
                        : "s"}{" "}
                      remaining
                    </small>
                  </div>

                  {/* ACTION */}
                  {activeAttempt ? (
                    <button
                      className="student-primary-button"
                      onClick={() =>
                        navigate(
                          `/student/attempts/${activeAttempt.attempt_id}`
                        )
                      }
                    >
                      Continue Quiz
                    </button>
                  ) : quiz.can_attempt ? (
                    <button
                      className="student-primary-button"
                      onClick={() =>
                        navigate(
                          `/student/quizzes/${quiz.id}`
                        )
                      }
                    >
                      View & Start Quiz
                    </button>
                  ) : (
                    <button
                      className="student-disabled-button"
                      disabled
                    >
                      Maximum Attempts Reached
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

const getQuizIcon = (category = "") => {
  const name = category.toLowerCase();

  if (name.includes("python")) {
    return "🐍";
  }

  if (name.includes("java")) {
    return "☕";
  }

  if (name.includes("react")) {
    return "⚛️";
  }

  if (name.includes("html")) {
    return "🌐";
  }

  if (name.includes("database")) {
    return "🗄️";
  }

  return "📝";
};

export default StudentQuizzes;