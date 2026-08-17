import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../../components/StudentLayout";
import api from "../../services/api";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const student = JSON.parse(localStorage.getItem("studentUser") || "{}");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("studentToken");

        const response = await api.get("/student/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setDashboard(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <StudentLayout>
        <p>Loading dashboard...</p>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <p style={{ color: "#dc2626" }}>{error}</p>
      </StudentLayout>
    );
  }

  const stats = dashboard.statistics;

  return (
    <StudentLayout>
      {/* WELCOME BANNER */}
      <div
        className="student-welcome-banner"
        style={{
          background: "linear-gradient(135deg, #6d5dfc, #8b5cf6)",
          color: "white",
          padding: "30px",
          borderRadius: "20px",
          marginBottom: "24px",
          boxShadow: "0 10px 30px rgba(109, 93, 252, 0.18)"
        }}
      >
        <p
          style={{
            margin: 0,
            opacity: 0.9
          }}
        >
          Welcome back,
        </p>

        <h1 className="student-welcome-name">{student.name || "Student"} 👋</h1>

        <p
          style={{
            margin: 0,
            opacity: 0.9
          }}
        >
          Ready to continue your learning journey?
        </p>
      </div>

      {/* STATISTICS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "16px"
        }}
      >
        <StatCard
          title="Total Attempts"
          value={stats.total_attempts}
          color="#6d5dfc"
        />

        <StatCard
          title="Passed"
          value={stats.passed_attempts}
          color="#22c55e"
        />

        <StatCard
          title="Failed"
          value={stats.failed_attempts}
          color="#ef4444"
        />

        <StatCard
          title="Average Score"
          value={`${stats.average_score}%`}
          color="#6366f1"
        />

        <StatCard
          title="Highest Score"
          value={`${stats.highest_score}%`}
          color="#f59e0b"
        />
      </div>
      {/* CONTINUE QUIZ */}
      {dashboard.activeAttempts.length > 0 && (
        <section
          style={{
            marginTop: "28px",
            background: "white",
            borderRadius: "18px",
            padding: "22px",
            border: "1px solid #eeeafc",
            boxShadow: "0 4px 15px rgba(84, 70, 150, 0.06)"
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#4f3cc9"
            }}
          >
            Continue Your Quiz
          </h2>

          {dashboard.activeAttempts.map((attempt) => (
            <div
              key={attempt.attempt_id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
                padding: "18px",
                background: "#faf9ff",
                borderRadius: "14px"
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>{attempt.quiz_title}</h3>

                <p
                  style={{
                    color: "#6b7280",
                    marginBottom: 0
                  }}
                >
                  Current Question: {Number(attempt.current_question) + 1}
                </p>
              </div>

              <button
                onClick={() =>
                  navigate(`/student/attempts/${attempt.attempt_id}`)
                }
                style={{
                  padding: "10px 18px",
                  background: "#6d5dfc",
                  color: "white",
                  border: "none",
                  borderRadius: "9px",
                  cursor: "pointer"
                }}
              >
                Continue Quiz
              </button>
            </div>
          ))}
        </section>
      )}

      {/* QUIZZES + RECENT ATTEMPTS */}
      <div className="student-dashboard-bottom-grid">
        {/* AVAILABLE QUIZZES */}
        <section
          className="student-dashboard-section"
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "22px",
            border: "1px solid #eeeafc",
            boxShadow: "0 4px 15px rgba(84, 70, 150, 0.06)"
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#4f3cc9"
            }}
          >
            Available Quizzes
          </h2>

          {dashboard.availableQuizzes.map((quiz) => {
            const hasQuestions = Number(quiz.total_questions) > 0;

            return (
              <div
                key={quiz.id}
                style={{
                  padding: "16px",
                  marginBottom: "14px",
                  borderRadius: "14px",
                  background: "#faf9ff",
                  border: "1px solid #f0edff"
                }}
              >
                <h3 style={{ margin: "0 0 6px" }}>{quiz.title}</h3>

                <p
                  style={{
                    margin: "0 0 10px",
                    color: "#6b7280"
                  }}
                >
                  {quiz.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "12px"
                  }}
                >
                  <span style={badgeStyle}>{quiz.category_name}</span>

                  <span style={badgeStyle}>{quiz.difficulty}</span>

                  <span style={badgeStyle}>{quiz.duration} min</span>

                  <span style={badgeStyle}>
                    Attempts {quiz.attempts_used}/{quiz.max_attempts}
                  </span>
                </div>
                <button
                  disabled={!quiz.can_attempt}
                  onClick={() => {
                    if (quiz.can_attempt) {
                      navigate(`/student/quizzes/${quiz.id}`);
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "none",
                    borderRadius: "9px",
                    cursor: quiz.can_attempt ? "pointer" : "not-allowed",

                    background: quiz.can_attempt ? "#6d5dfc" : "#e5e7eb",

                    color: quiz.can_attempt ? "white" : "#9ca3af"
                  }}
                >
                  {!hasQuestions
                    ? "No Questions Available"
                    : quiz.attempts_remaining <= 0
                      ? "Maximum Attempts Reached"
                      : "Start Quiz"}
                </button>
              </div>
            );
          })}
        </section>

        {/* RECENT ATTEMPTS */}
        <section
          className="student-dashboard-section"
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "22px",
            border: "1px solid #eeeafc",
            boxShadow: "0 4px 15px rgba(84, 70, 150, 0.06)"
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#4f3cc9"
            }}
          >
            Recent Attempts
          </h2>

          {dashboard.recentAttempts.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No completed attempts yet.</p>
          ) : (
            dashboard.recentAttempts.map((attempt) => (
              <div
                key={attempt.attempt_id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px",
                  marginBottom: "12px",
                  background: "#faf9ff",
                  borderRadius: "12px"
                }}
              >
                <div>
                  <strong>{attempt.quiz_title}</strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#6b7280",
                      fontSize: "14px"
                    }}
                  >
                    Score: {attempt.percentage}%
                  </p>
                </div>

                <span
                  style={{
                    padding: "6px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background:
                      attempt.status === "PASSED" ? "#dcfce7" : "#fee2e2",
                    color: attempt.status === "PASSED" ? "#15803d" : "#dc2626"
                  }}
                >
                  {attempt.status}
                </span>
              </div>
            ))
          )}
          {/* PERFORMANCE ANALYTICS */}
          <div className="student-performance-grid">
            {/* PERFORMANCE TREND */}
            <section className="student-performance-card">
              <div className="student-section-header">
                <div>
                  <h2>Performance Over Time</h2>
                  <p>See how your quiz scores are changing across attempts.</p>
                </div>
              </div>

              {dashboard.performanceTrend.length === 0 ? (
                <p className="student-empty-text">
                  No performance data available yet.
                </p>
              ) : (
                <div className="student-performance-list">
                  {dashboard.performanceTrend.map((attempt, index) => {
                    const percentage = Number(attempt.percentage) || 0;

                    return (
                      <div
                        key={attempt.attempt_id}
                        className="student-performance-item"
                      >
                        <div className="student-performance-item-top">
                          <div>
                            <strong>Attempt {index + 1}</strong>

                            <span>{attempt.quiz_title}</span>
                          </div>

                          <strong
                            className={
                              percentage >= 60
                                ? "student-score-good"
                                : "student-score-low"
                            }
                          >
                            {percentage.toFixed(0)}%
                          </strong>
                        </div>

                        <div className="student-performance-track">
                          <div
                            className="student-performance-fill"
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                              background:
                                percentage >= 60 ? "#22c55e" : "#8b5cf6"
                            }}
                          />
                        </div>

                        <small>
                          {formatDashboardDate(attempt.completed_at)}
                        </small>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* CATEGORY PERFORMANCE */}
            <section className="student-performance-card">
              <div className="student-section-header">
                <div>
                  <h2>Category Performance</h2>
                  <p>Your average score across different subjects.</p>
                </div>
              </div>

              {dashboard.categoryPerformance.length === 0 ? (
                <p className="student-empty-text">
                  No category performance available yet.
                </p>
              ) : (
                <div className="student-performance-list">
                  {dashboard.categoryPerformance.map((category) => {
                    const percentage = Number(category.average_score) || 0;

                    return (
                      <div
                        key={category.category_name}
                        className="student-performance-item"
                      >
                        <div className="student-performance-item-top">
                          <div>
                            <strong>{category.category_name}</strong>

                            <span>
                              {category.total_attempts} attempt
                              {Number(category.total_attempts) === 1 ? "" : "s"}
                            </span>
                          </div>

                          <strong>{percentage.toFixed(0)}%</strong>
                        </div>

                        <div className="student-performance-track">
                          <div
                            className="student-performance-fill"
                            style={{
                              width: `${Math.min(percentage, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </StudentLayout>
  );
};

const badgeStyle = {
  padding: "5px 9px",
  borderRadius: "20px",
  background: "#f0edff",
  color: "#5b3fd6",
  fontSize: "12px",
  fontWeight: "500"
};

const formatDashboardDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short"
  });
};

const StatCard = ({ title, value, color }) => {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid #eeeafc",
        boxShadow: "0 4px 15px rgba(84, 70, 150, 0.06)"
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "12px",
          background: `${color}15`,
          marginBottom: "12px"
        }}
      />

      <h2
        style={{
          margin: 0,
          color
        }}
      >
        {value}
      </h2>

      <p
        style={{
          margin: "6px 0 0",
          color: "#6b7280"
        }}
      >
        {title}
      </p>
    </div>
  );
};

export default StudentDashboard;
