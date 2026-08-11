import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import StudentLayout from "../../components/StudentLayout";
import api from "../../services/api";

const StudentAttemptHistory = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token =
          localStorage.getItem("studentToken");

        const response = await api.get(
          "/student/attempts/history",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setAttempts(response.data.attempts || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load attempt history"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <StudentLayout>
        <p>Loading attempt history...</p>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <p style={{ color: "#dc2626" }}>
          {error}
        </p>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto"
        }}
      >
        <div
          style={{
            marginBottom: "24px"
          }}
        >
          <h1
            style={{
              marginBottom: "6px",
              color: "#3f3a64"
            }}
          >
            Attempt History
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6b7280"
            }}
          >
            Review all your completed quiz attempts.
          </p>
        </div>

        {attempts.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "35px",
              borderRadius: "18px",
              border: "1px solid #eeeafc",
              textAlign: "center"
            }}
          >
            <h3>No attempts yet</h3>

            <p style={{ color: "#6b7280" }}>
              Complete a quiz and it will appear here.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "16px"
            }}
          >
            {attempts.map((attempt) => {
              const passed =
                attempt.status === "PASSED";

              return (
                <div
                  key={attempt.attempt_id}
                  style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "16px",
                    border: "1px solid #eeeafc",
                    boxShadow:
                      "0 4px 15px rgba(84,70,150,0.05)"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "20px"
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          margin: "0 0 6px",
                          color: "#2f2a4a"
                        }}
                      >
                        {attempt.quiz_title}
                      </h2>

                      <p
                        style={{
                          margin: "0 0 10px",
                          color: "#6b7280"
                        }}
                      >
                        {attempt.category_name} •{" "}
                        {attempt.difficulty}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px"
                        }}
                      >
                        <span style={badgeStyle}>
                          Score: {attempt.percentage}%
                        </span>

                        <span style={badgeStyle}>
                          Correct:{" "}
                          {attempt.correct_answers}
                        </span>

                        <span style={badgeStyle}>
                          Incorrect:{" "}
                          {attempt.incorrect_answers}
                        </span>

                        <span style={badgeStyle}>
                          Unanswered:{" "}
                          {attempt.unanswered}
                        </span>

                        <span style={badgeStyle}>
                          Time:{" "}
                          {formatDuration(
                            attempt.time_taken
                          )}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "10px"
                      }}
                    >
                      <span
                        style={{
                          padding: "7px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "700",
                          background: passed
                            ? "#dcfce7"
                            : "#fee2e2",
                          color: passed
                            ? "#15803d"
                            : "#dc2626"
                        }}
                      >
                        {attempt.status}
                      </span>

                      <small
                        style={{
                          color: "#9ca3af"
                        }}
                      >
                        {formatDate(
                          attempt.completed_at
                        )}
                      </small>

                      <button
                        onClick={() =>
                          navigate(
                            `/student/attempts/${attempt.attempt_id}/result`
                          )
                        }
                        style={{
                          padding: "9px 15px",
                          border: "none",
                          borderRadius: "9px",
                          background: "#6d5dfc",
                          color: "white",
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                      >
                        View Result
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

const badgeStyle = {
  padding: "6px 10px",
  borderRadius: "20px",
  background: "#f0edff",
  color: "#5b3fd6",
  fontSize: "12px",
  fontWeight: "500"
};

const formatDuration = (seconds) => {
  const total = Number(seconds) || 0;

  const minutes = Math.floor(total / 60);
  const remainingSeconds = total % 60;

  return `${minutes}m ${remainingSeconds}s`;
};

const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
};

export default StudentAttemptHistory;