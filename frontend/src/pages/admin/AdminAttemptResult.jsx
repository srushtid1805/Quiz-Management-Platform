import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams
} from "react-router-dom";

import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

const AdminAttemptResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [review, setReview] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttemptResult = async () => {
      try {
        const token =
          localStorage.getItem("adminToken");

        const response = await api.get(
          `/admin/attempts/${attemptId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setAttempt(response.data.attempt);

        setReview(
          response.data.review || []
        );

      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load attempt result"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptResult();

  }, [attemptId]);

  if (loading) {
    return (
      <AdminLayout>
        <p>Loading result...</p>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="admin-result-error">
          {error}
        </div>
      </AdminLayout>
    );
  }

  if (!attempt) {
    return (
      <AdminLayout>
        <p>Attempt not found.</p>
      </AdminLayout>
    );
  }

  const passed =
    attempt.status === "PASSED";

  return (
    <AdminLayout>

      <div className="admin-result-page">

        {/* BACK */}
        <button
          className="admin-result-back"
          onClick={() =>
            navigate("/admin/attempts")
          }
        >
          ← Back to Attempts
        </button>


        {/* STUDENT INFO */}
        <div className="admin-result-student">

          <div>
            <span>
              Student Result
            </span>

            <h2>
              {attempt.student_name}
            </h2>

            <p>
              {attempt.student_email}
            </p>
          </div>

          <div className="admin-result-quiz-info">

            <strong>
              {attempt.quiz_title}
            </strong>

            <span>
              {attempt.category_name} •{" "}
              {attempt.difficulty}
            </span>

          </div>

        </div>


        {/* RESULT HEADER */}
        <div
          className={
            passed
              ? "admin-result-header passed"
              : "admin-result-header failed"
          }
        >

          <div className="admin-result-icon">
            {passed ? "✓" : "✕"}
          </div>

          <h1>
            {attempt.percentage}%
          </h1>

          <strong>
            {attempt.status}
          </strong>

          <p>
            Passing Score:{" "}
            {attempt.passing_score}%
          </p>

        </div>


        {/* STATISTICS */}
        <div className="admin-result-stats">

          <ResultCard
            label="Score"
            value={attempt.score}
            color="#6d5dfc"
          />

          <ResultCard
            label="Correct"
            value={
              attempt.correct_answers
            }
            color="#22c55e"
          />

          <ResultCard
            label="Incorrect"
            value={
              attempt.incorrect_answers
            }
            color="#ef4444"
          />

          <ResultCard
            label="Unanswered"
            value={attempt.unanswered}
            color="#f59e0b"
          />

          <ResultCard
            label="Time Taken"
            value={formatDuration(
              attempt.time_taken
            )}
            color="#6366f1"
          />

        </div>


        {/* ATTEMPT DETAILS */}
        <div className="admin-attempt-summary">

          <h2>
            Attempt Information
          </h2>

          <div className="admin-attempt-summary-grid">

            <SummaryItem
              label="Started"
              value={formatDateTime(
                attempt.started_at
              )}
            />

            <SummaryItem
              label="Completed"
              value={formatDateTime(
                attempt.completed_at
              )}
            />

            <SummaryItem
              label="Difficulty"
              value={attempt.difficulty}
            />

            <SummaryItem
              label="Category"
              value={
                attempt.category_name
              }
            />

          </div>

        </div>


        {/* ANSWER REVIEW */}
        <div className="admin-answer-review">

          <h2>
            Answer Review
          </h2>

          {review.length === 0 ? (
            <p>
              No answer review available.
            </p>
          ) : (
            review.map(
              (item, index) => (

                <div
                  key={item.questionId}
                  className={`admin-review-card ${
                    item.status.toLowerCase()
                  }`}
                >

                  <div className="admin-review-top">

                    <strong>
                      {index + 1}.{" "}
                      {
                        item.questionText
                      }
                    </strong>

                    <span>
                      {item.status}
                    </span>

                  </div>


                  <p>
                    <b>
                      Student Answer:
                    </b>{" "}
                    {item.selectedAnswer ||
                      "Not answered"}
                  </p>


                  <p>
                    <b>
                      Correct Answer:
                    </b>{" "}
                    {item.correctAnswer ||
                      "-"}
                  </p>


                  {item.explanation && (
                    <p className="admin-review-explanation">

                      <b>
                        Explanation:
                      </b>{" "}

                      {
                        item.explanation
                      }

                    </p>
                  )}

                </div>

              )
            )
          )}

        </div>

      </div>

    </AdminLayout>
  );
};


const ResultCard = ({
  label,
  value,
  color
}) => (
  <div className="admin-result-stat-card">

    <h2
      style={{
        color
      }}
    >
      {value}
    </h2>

    <p>
      {label}
    </p>

  </div>
);


const SummaryItem = ({
  label,
  value
}) => (
  <div className="admin-summary-item">

    <span>
      {label}
    </span>

    <strong>
      {value || "-"}
    </strong>

  </div>
);


const formatDuration = (seconds) => {
  const total =
    Number(seconds) || 0;

  const minutes =
    Math.floor(total / 60);

  const remainingSeconds =
    total % 60;

  return `${minutes}m ${remainingSeconds}s`;
};


const formatDateTime = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
};


export default AdminAttemptResult;