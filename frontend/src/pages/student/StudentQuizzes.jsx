import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import StudentLayout from "../../components/StudentLayout";
import api from "../../services/api";

const StudentQuizzes = () => {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [activeAttempts, setActiveAttempts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem("studentToken");

        const response = await api.get("/student/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setQuizzes(response.data.availableQuizzes || []);

        setActiveAttempts(response.data.activeAttempts || []);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter((quiz) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      !keyword ||
      quiz.title?.toLowerCase().includes(keyword) ||
      quiz.category_name?.toLowerCase().includes(keyword) ||
      quiz.difficulty?.toLowerCase().includes(keyword);

    const matchesCategory =
      selectedCategory === "ALL" || quiz.category_name === selectedCategory;

    const matchesDifficulty =
      selectedDifficulty === "ALL" || quiz.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getActiveAttempt = (quizId) => {
    return activeAttempts.find(
      (attempt) => Number(attempt.quiz_id) === Number(quizId)
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
        <div className="student-error-box">{error}</div>
      </StudentLayout>
    );
  }

  const categories = [
    "ALL",
    ...new Set(quizzes.map((quiz) => quiz.category_name).filter(Boolean))
  ];

  const difficulties = [
    "ALL",
    ...new Set(quizzes.map((quiz) => quiz.difficulty).filter(Boolean))
  ];

  return (
    <StudentLayout>
      <div className="student-quizzes-page">
        {/* HEADER */}
        <div className="student-page-header">
          <div>
            <h1>My Quizzes</h1>

            <p>Explore available quizzes and continue your learning.</p>
          </div>

          <div className="student-quiz-count">{quizzes.length} Quizzes</div>
        </div>

        {/* SEARCH */}
        <div className="student-search-wrapper">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search quizzes by title, category or difficulty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="student-filter-row">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "ALL" ? "All Categories" : category}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty === "ALL" ? "All Difficulties" : difficulty}
              </option>
            ))}
          </select>

          {(selectedCategory !== "ALL" ||
            selectedDifficulty !== "ALL" ||
            search) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("ALL");
                setSelectedDifficulty("ALL");
              }}
              className="student-clear-filter-button"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* QUIZZES */}
        {filteredQuizzes.length === 0 ? (
          <div className="student-empty-state">
            <h3>No quizzes found</h3>

            <p> Try changing your search or filters.</p>
          </div>
        ) : (
          <div className="student-quizzes-grid">
            {filteredQuizzes.map((quiz) => {
              const activeAttempt = getActiveAttempt(quiz.id);

              return (
                <div key={quiz.id} className="student-full-quiz-card">
                  {/* QUIZ HEADER */}
                  <div className="student-quiz-card-top">
                    <div className="student-quiz-icon">
                      {getQuizIcon(quiz.category_name)}
                    </div>

                    <div>
                      <span className="student-category-badge">
                        {quiz.category_name}
                      </span>

                      <h2>{quiz.title}</h2>
                    </div>
                  </div>

                  <p className="student-quiz-description">{quiz.description}</p>

                  {/* INFO */}
                  <div className="student-quiz-meta">
                    <span>🎯 {quiz.difficulty}</span>

                    <span>⏱ {quiz.duration} min</span>

                    <span>✅ Pass: {quiz.passing_score}%</span>
                  </div>

                  {/* ATTEMPTS */}
                  <div className="student-attempt-progress">
                    <div className="student-attempt-row">
                      <span>Attempts Used</span>

                      <strong>
                        {quiz.attempts_used}/{quiz.max_attempts}
                      </strong>
                    </div>

                    <div className="student-progress-track">
                      <div
                        className="student-progress-fill"
                        style={{
                          width: `${Math.min(
                            100,
                            quiz.max_attempts > 0
                              ? (quiz.attempts_used / quiz.max_attempts) * 100
                              : 0
                          )}%`
                        }}
                      />
                    </div>

                    <small>
                      {quiz.attempts_remaining} attempt
                      {quiz.attempts_remaining === 1 ? "" : "s"} remaining
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
                      onClick={() => navigate(`/student/quizzes/${quiz.id}`)}
                    >
                      View & Start Quiz
                    </button>
                  ) : (
                    <button className="student-disabled-button" disabled>
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
