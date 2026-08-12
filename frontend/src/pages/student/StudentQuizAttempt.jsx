import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import StudentLayout from "../../components/StudentLayout";
import api from "../../services/api";

const StudentQuizAttempt = () => {
  const { attemptId } = useParams();
  const [warningMessage, setWarningMessage] = useState("");
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const token = localStorage.getItem("studentToken");

        const response = await api.get(
          `/student/attempts/${attemptId}/questions`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setAttempt(response.data.attempt);

        setQuestions(response.data.questions || []);

        setCurrentQuestion(Number(response.data.attempt.current_question) || 0);

        setRemainingSeconds(Number(response.data.remainingSeconds) || 0);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load quiz attempt"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [attemptId]);

  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  useEffect(() => {
    if (remainingSeconds === 900) {
      setWarningMessage("15 minutes remaining");
    }

    if (remainingSeconds === 600) {
      setWarningMessage("10 minutes remaining");
    }

    if (remainingSeconds === 300) {
      setWarningMessage("5 minutes remaining");
    }
  }, [remainingSeconds]);

  useEffect(() => {
    if (!warningMessage) return;

    const timeout = setTimeout(() => {
      setWarningMessage("");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [warningMessage]);

  useEffect(() => {
    if (remainingSeconds !== 0 || !attempt || loading) {
      return;
    }

    const autoSubmitQuiz = async () => {
      try {
        const token = localStorage.getItem("studentToken");

        await api.post(
          `/student/attempts/${attemptId}/auto-submit`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        navigate(`/student/attempts/${attemptId}/result`);
      } catch (error) {
        console.error("Auto submit failed:", error);

        alert(
          error.response?.data?.message ||
            "Quiz could not be submitted automatically."
        );
      }
    };

    autoSubmitQuiz();
  }, [remainingSeconds, attempt, attemptId, loading, navigate]);

  const handleSelectOption = async (optionId) => {
    try {
      const token = localStorage.getItem("studentToken");

      const question = questions[currentQuestion];

      await api.put(
        `/student/attempts/${attemptId}/progress`,
        {
          questionId: question.id,
          selectedOptionId: optionId,
          currentQuestion
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const updatedQuestions = [...questions];

      updatedQuestions[currentQuestion] = {
        ...updatedQuestions[currentQuestion],
        selected_option_id: optionId
      };

      setQuestions(updatedQuestions);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save answer");
    }
  };

  const handleQuestionChange = async (newIndex) => {
    if (newIndex < 0 || newIndex >= questions.length) {
      return;
    }

    try {
      const token = localStorage.getItem("studentToken");

      const current = questions[currentQuestion];

      /*
      If the current question has an answer,
      save both answer + new position.
    */
      if (current.selected_option_id) {
        await api.put(
          `/student/attempts/${attemptId}/progress`,
          {
            questionId: current.id,
            selectedOptionId: current.selected_option_id,
            currentQuestion: newIndex
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } else {
        /*
        No answer was selected.
        We still need to remember where
        the student navigated.
      */

        await api.put(
          `/student/attempts/${attemptId}/position`,
          {
            currentQuestion: newIndex
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }

      setCurrentQuestion(newIndex);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save quiz progress");
    }
  };

  const handleSubmitQuiz = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to submit the quiz?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("studentToken");

      const response = await api.post(
        `/student/attempts/${attemptId}/submit`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      navigate(`/student/attempts/${attemptId}/result`);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit quiz");
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <p>Loading quiz...</p>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "18px",
            borderRadius: "12px"
          }}
        >
          {error}
        </div>
      </StudentLayout>
    );
  }

  if (!attempt || questions.length === 0) {
    return (
      <StudentLayout>
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "18px",
            border: "1px solid #eeeafc"
          }}
        >
          <h2>No questions available</h2>

          <p style={{ color: "#6b7280" }}>
            This quiz currently does not contain any questions.
          </p>
        </div>
      </StudentLayout>
    );
  }

  const question = questions[currentQuestion];

  return (
    <StudentLayout>
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto"
        }}
      >
        {/* TOP QUIZ BAR */}
        <div
          style={{
            background: "linear-gradient(135deg, #6d5dfc, #8b5cf6)",
            color: "white",
            padding: "24px",
            borderRadius: "18px",
            marginBottom: "22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px"
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                opacity: 0.85
              }}
            >
              Quiz in Progress
            </p>

            <h2
              style={{
                margin: "5px 0 0"
              }}
            >
              Question {currentQuestion + 1} of {questions.length}
            </h2>
          </div>

          <div
            style={{
              background:
                remainingSeconds <= 30 ? "#fee2e2" : "rgba(255,255,255,0.18)",

              color: remainingSeconds <= 30 ? "#dc2626" : "white",

              padding: "12px 18px",
              borderRadius: "12px",
              textAlign: "center",

              border:
                remainingSeconds <= 30
                  ? "2px solid #ef4444"
                  : "2px solid transparent",

              transition: "all 0.3s ease"
            }}
          >
            <small>Time Remaining</small>

            <h2
              style={{
                margin: "4px 0 0"
              }}
            >
              {formatTime(remainingSeconds)}
            </h2>
          </div>
        </div>
        {warningMessage && (
          <div
            style={{
              marginTop: "16px",
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "10px",
              background: "#fff7ed",
              color: "#c2410c",
              border: "1px solid #fed7aa",
              fontWeight: "600"
            }}
          >
            ⏰ {warningMessage}
          </div>
        )}

        {/* QUESTION CARD */}
        <div
          style={{
            background: "white",
            padding: "28px",
            borderRadius: "18px",
            border: "1px solid #eeeafc",
            boxShadow: "0 4px 15px rgba(84,70,150,0.06)"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "15px",
              marginBottom: "18px"
            }}
          >
            <span
              style={{
                color: "#6d5dfc",
                background: "#f0edff",
                padding: "6px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600"
              }}
            >
              {question.difficulty}
            </span>

            <span
              style={{
                color: "#6b7280"
              }}
            >
              {question.marks} mark
            </span>
          </div>

          <h2
            style={{
              color: "#1f2937",
              marginBottom: "25px",
              lineHeight: "1.5"
            }}
          >
            {question.question_text}
          </h2>

          {/* OPTIONS WILL COME IN PART 2 */}
          {/* OPTIONS */}
          <div
            style={{
              display: "grid",
              gap: "12px"
            }}
          >
            {question.options.map((option) => {
              const selected =
                Number(question.selected_option_id) === Number(option.id);

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectOption(option.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "16px 18px",
                    borderRadius: "12px",

                    border: selected
                      ? "2px solid #6d5dfc"
                      : "1px solid #e5e7eb",

                    background: selected ? "#f0edff" : "white",

                    color: "#1f2937",
                    cursor: "pointer",
                    fontSize: "15px"
                  }}
                >
                  {option.option_text}
                </button>
              );
            })}
          </div>

          {/* NAVIGATION BUTTONS */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px"
            }}
          >
            {/* PREVIOUS */}
            <button
              type="button"
              onClick={() => handleQuestionChange(currentQuestion - 1)}
              disabled={currentQuestion === 0}
              style={{
                padding: "10px 20px",
                borderRadius: "9px",
                border: "1px solid #d1d5db",

                background: currentQuestion === 0 ? "#f9fafb" : "white",

                color: currentQuestion === 0 ? "#9ca3af" : "#374151",

                cursor: currentQuestion === 0 ? "not-allowed" : "pointer"
              }}
            >
              ← Previous
            </button>

            {/* NEXT OR SUBMIT */}
            {currentQuestion < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => handleQuestionChange(currentQuestion + 1)}
                style={{
                  padding: "10px 24px",
                  borderRadius: "9px",
                  border: "none",
                  background: "#6d5dfc",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                style={{
                  padding: "10px 24px",
                  borderRadius: "9px",
                  border: "none",
                  background: "#22c55e",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);

  const minutes = Math.floor(safeSeconds / 60);

  const remaining = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(
    2,
    "0"
  )}`;
};

export default StudentQuizAttempt;
