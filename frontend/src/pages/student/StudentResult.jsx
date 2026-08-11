import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams
} from "react-router-dom";

import StudentLayout from "../../components/StudentLayout";
import api from "../../services/api";

const StudentResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [review, setReview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token =
          localStorage.getItem("studentToken");

        const response = await api.get(
          `/student/attempts/${attemptId}/result`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setResult(response.data.result);
        setReview(response.data.review || []);

      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Failed to load quiz result"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <StudentLayout>
        <p>Loading result...</p>
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

  const passed = result.status === "PASSED";

  return (
    <StudentLayout>
      <div
        style={{
          maxWidth: "950px",
          margin: "0 auto"
        }}
      >
        {/* RESULT HEADER */}
        <div
          style={{
            textAlign: "center",
            background: passed
              ? "linear-gradient(135deg, #22c55e, #16a34a)"
              : "linear-gradient(135deg, #6d5dfc, #8b5cf6)",
            color: "white",
            padding: "35px",
            borderRadius: "22px"
          }}
        >
          <div
            style={{
              fontSize: "45px",
              marginBottom: "8px"
            }}
          >
            {passed ? "🎉" : "📚"}
          </div>

          <h1 style={{ margin: "0 0 8px" }}>
            {passed
              ? "Congratulations!"
              : "Keep Learning!"}
          </h1>

          <p style={{ margin: 0 }}>
            {result.quizTitle}
          </p>

          <h2
            style={{
              fontSize: "38px",
              margin: "18px 0 5px"
            }}
          >
            {result.percentage}%
          </h2>

          <strong>
            {result.status}
          </strong>
        </div>

        {/* RESULT STATISTICS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "15px",
            marginTop: "22px"
          }}
        >
          <ResultCard
            label="Score"
            value={result.score}
            color="#6d5dfc"
          />

          <ResultCard
            label="Correct"
            value={result.correctAnswers}
            color="#22c55e"
          />

          <ResultCard
            label="Incorrect"
            value={result.incorrectAnswers}
            color="#ef4444"
          />

          <ResultCard
            label="Unanswered"
            value={result.unanswered}
            color="#f59e0b"
          />

          <ResultCard
            label="Time Taken"
            value={formatDuration(
              result.timeTaken
            )}
            color="#6366f1"
          />
        </div>

        {/* ANSWER REVIEW */}
        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "18px",
            marginTop: "24px",
            border: "1px solid #eeeafc"
          }}
        >
          <h2
            style={{
              color: "#4f3cc9",
              marginTop: 0
            }}
          >
            Answer Review
          </h2>

          {review.map((item, index) => (
            <div
              key={item.questionId}
              style={{
                padding: "18px",
                marginBottom: "15px",
                borderRadius: "14px",
                background:
                  item.status === "CORRECT"
                    ? "#f0fdf4"
                    : item.status === "UNANSWERED"
                    ? "#fffbeb"
                    : "#fef2f2",
                border:
                  item.status === "CORRECT"
                    ? "1px solid #bbf7d0"
                    : item.status === "UNANSWERED"
                    ? "1px solid #fde68a"
                    : "1px solid #fecaca"
              }}
            >
              <strong>
                {index + 1}.{" "}
                {item.questionText ||
                  `Question ${index + 1}`}
              </strong>

              <p>
                <b>Your answer:</b>{" "}
                {item.selectedAnswer ||
                  "Not answered"}
              </p>

              {item.correctAnswer && (
                <p>
                  <b>Correct answer:</b>{" "}
                  {item.correctAnswer}
                </p>
              )}

              {item.explanation && (
                <p
                  style={{
                    color: "#6b7280",
                    marginBottom: 0
                  }}
                >
                  <b>Explanation:</b>{" "}
                  {item.explanation}
                </p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() =>
            navigate("/student/dashboard")
          }
          style={{
            width: "100%",
            marginTop: "22px",
            padding: "13px",
            background: "#6d5dfc",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </StudentLayout>
  );
};

const ResultCard = ({
  label,
  value,
  color
}) => (
  <div
    style={{
      background: "white",
      padding: "20px",
      borderRadius: "15px",
      textAlign: "center",
      border: "1px solid #eeeafc"
    }}
  >
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
      {label}
    </p>
  </div>
);

const formatDuration = (seconds) => {
  const total = Number(seconds) || 0;

  const minutes = Math.floor(total / 60);
  const remainingSeconds = total % 60;

  return `${minutes}m ${remainingSeconds}s`;
};

export default StudentResult;