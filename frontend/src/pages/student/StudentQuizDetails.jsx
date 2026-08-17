import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import StudentLayout from "../../components/StudentLayout";
import api from "../../services/api";

const StudentQuizDetails = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const token = localStorage.getItem("studentToken");

        const response = await api.get(`/student/quizzes/${quizId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setQuiz(response.data.quiz);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  const handleStartQuiz = async () => {
    try {
      setStarting(true);
      setError("");

      const token = localStorage.getItem("studentToken");

      const response = await api.post(
        `/student/quizzes/${quizId}/start`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const attemptId = response.data.attempt.id;

      navigate(`/student/attempts/${attemptId}`);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to start quiz");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <p>Loading quiz...</p>
      </StudentLayout>
    );
  }

  if (error && !quiz) {
    return (
      <StudentLayout>
        <p style={{ color: "#dc2626" }}>{error}</p>
      </StudentLayout>
    );
  }

  const hasQuestions = Number(quiz?.total_questions) > 0;
  return (
    <StudentLayout>
      <div
        style={{
          maxWidth: "850px",
          margin: "0 auto"
        }}
      >
        <button
          onClick={() => navigate("/student/dashboard")}
          style={{
            border: "none",
            background: "transparent",
            color: "#6d5dfc",
            cursor: "pointer",
            marginBottom: "20px",
            fontWeight: "600"
          }}
        >
          ← Back to Dashboard
        </button>

        <div
          style={{
            background: "linear-gradient(135deg, #6d5dfc, #8b5cf6)",
            color: "white",
            padding: "32px",
            borderRadius: "22px",
            marginBottom: "22px",
            boxShadow: "0 10px 30px rgba(109, 93, 252, 0.18)"
          }}
        >
          <span
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.18)",
              padding: "6px 12px",
              borderRadius: "20px",
              marginBottom: "12px"
            }}
          >
            {quiz.category_name}
          </span>

          <h1
            style={{
              margin: "0 0 10px"
            }}
          >
            {quiz.title}
          </h1>

          <p
            style={{
              margin: 0,
              opacity: 0.9
            }}
          >
            {quiz.description}
          </p>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "24px",
            border: "1px solid #eeeafc",
            boxShadow: "0 4px 15px rgba(84,70,150,0.06)"
          }}
        >
          <h2
            style={{
              color: "#4f3cc9",
              marginTop: 0
            }}
          >
            Quiz Information
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginTop: "20px"
            }}
          >
            <InfoCard label="Questions" value={quiz.total_questions} />

            <InfoCard label="Duration" value={`${quiz.duration} min`} />

            <InfoCard label="Difficulty" value={quiz.difficulty} />

            <InfoCard label="Passing Score" value={`${quiz.passing_score}%`} />

            <InfoCard label="Maximum Attempts" value={quiz.max_attempts} />
          </div>

          <div
            style={{
              marginTop: "24px",
              padding: "18px",
              background: "#faf9ff",
              borderRadius: "14px",
              color: "#4b5563"
            }}
          >
            <strong>Before you start:</strong>

            <p style={{ marginBottom: 0 }}>
              Once the quiz begins, the timer starts immediately. Your answers
              and progress will be saved while you attempt the quiz.
            </p>
          </div>

          {error && (
            <p
              style={{
                color: "#dc2626",
                marginTop: "16px"
              }}
            >
              {error}
            </p>
          )}
          {!hasQuestions && (
            <div
              style={{
                marginTop: "18px",
                padding: "12px 14px",
                borderRadius: "10px",
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                color: "#c2410c",
                fontSize: "14px"
              }}
            >
              This quiz is not available yet because no questions have been
              added.
            </div>
          )}

          <button
            onClick={handleStartQuiz}
            disabled={starting || !hasQuestions}
            style={{
              width: "100%",
              marginTop: "24px",
              padding: "13px",
              border: "none",
              borderRadius: "10px",

              background: hasQuestions ? "#6d5dfc" : "#e5e7eb",

              color: hasQuestions ? "white" : "#9ca3af",

              cursor: starting || !hasQuestions ? "not-allowed" : "pointer",

              fontWeight: "600",
              fontSize: "15px"
            }}
          >
            {!hasQuestions
              ? "No Questions Available"
              : starting
                ? "Starting Quiz..."
                : "Start Quiz"}
          </button>
        </div>
      </div>
    </StudentLayout>
  );
};

const InfoCard = ({ label, value }) => {
  return (
    <div
      style={{
        background: "#faf9ff",
        border: "1px solid #f0edff",
        padding: "18px",
        borderRadius: "14px"
      }}
    >
      <p
        style={{
          margin: "0 0 6px",
          color: "#6b7280",
          fontSize: "13px"
        }}
      >
        {label}
      </p>

      <strong
        style={{
          color: "#4f3cc9",
          fontSize: "18px"
        }}
      >
        {value}
      </strong>
    </div>
  );
};

export default StudentQuizDetails;
