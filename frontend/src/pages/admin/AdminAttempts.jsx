import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

const AdminAttempts = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("adminToken");

      const response = await api.get(
        "/admin/attempts",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAttempts(
        response.data.attempts || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load attempts"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  const filteredAttempts =
    attempts.filter((attempt) => {
      const keyword =
        search.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        attempt.student_name
          ?.toLowerCase()
          .includes(keyword) ||
        attempt.student_email
          ?.toLowerCase()
          .includes(keyword) ||
        attempt.quiz_title
          ?.toLowerCase()
          .includes(keyword) ||
        attempt.category_name
          ?.toLowerCase()
          .includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" ||
        attempt.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  return (
    <AdminLayout>
      <div className="admin-attempts-page">

        <div className="admin-page-heading">
          <div>
            <h1>Attempts & Results</h1>

            <p>
              Review completed student quiz
              attempts and detailed results.
            </p>
          </div>

          <div className="admin-attempt-count">
            {attempts.length} Attempts
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="admin-attempt-toolbar">

          <input
            type="text"
            placeholder="Search student, email, quiz or category..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="ALL">
              All Status
            </option>

            <option value="PASSED">
              Passed
            </option>

            <option value="FAILED">
              Failed
            </option>
          </select>

          {(search ||
            statusFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
            >
              Clear
            </button>
          )}
        </div>

        {loading && (
          <p>Loading attempts...</p>
        )}

        {error && (
          <p style={{ color: "#dc2626" }}>
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          filteredAttempts.length === 0 && (
            <div className="admin-empty-state">
              <p>No attempts found.</p>
            </div>
          )}

        {!loading &&
          !error &&
          filteredAttempts.length > 0 && (
            <>
              {/* DESKTOP TABLE */}
              <div className="admin-attempt-table-wrapper">
                <table className="admin-attempt-table">
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Student</th>
                      <th>Quiz</th>
                      <th>Category</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Completed</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAttempts.map(
                      (attempt, index) => (
                        <tr
                          key={
                            attempt.attempt_id
                          }
                        >
                          <td>
                            {index + 1}
                          </td>

                          <td>
                            <strong>
                              {
                                attempt.student_name
                              }
                            </strong>

                            <small>
                              {
                                attempt.student_email
                              }
                            </small>
                          </td>

                          <td>
                            {
                              attempt.quiz_title
                            }
                          </td>

                          <td>
                            {
                              attempt.category_name
                            }
                          </td>

                          <td>
                            {
                              attempt.percentage
                            }
                            %
                          </td>

                          <td>
                            <StatusBadge
                              status={
                                attempt.status
                              }
                            />
                          </td>

                          <td>
                            {formatDate(
                              attempt.completed_at
                            )}
                          </td>

                          <td>
                            <button
                              className="admin-view-result-button"
                              onClick={() =>
                                navigate(
                                  `/admin/attempts/${attempt.attempt_id}`
                                )
                              }
                            >
                              View Result
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="admin-attempt-mobile-list">
                {filteredAttempts.map(
                  (attempt) => (
                    <div
                      key={
                        attempt.attempt_id
                      }
                      className="admin-attempt-mobile-card"
                    >
                      <div className="admin-attempt-mobile-top">
                        <div>
                          <h3>
                            {
                              attempt.student_name
                            }
                          </h3>

                          <p>
                            {
                              attempt.student_email
                            }
                          </p>
                        </div>

                        <StatusBadge
                          status={
                            attempt.status
                          }
                        />
                      </div>

                      <div className="admin-attempt-mobile-info">
                        <span>
                          <b>Quiz:</b>{" "}
                          {
                            attempt.quiz_title
                          }
                        </span>

                        <span>
                          <b>Category:</b>{" "}
                          {
                            attempt.category_name
                          }
                        </span>

                        <span>
                          <b>Score:</b>{" "}
                          {
                            attempt.percentage
                          }
                          %
                        </span>

                        <span>
                          <b>Completed:</b>{" "}
                          {formatDate(
                            attempt.completed_at
                          )}
                        </span>
                      </div>

                      <button
                        className="admin-view-result-button"
                        onClick={() =>
                          navigate(
                            `/admin/attempts/${attempt.attempt_id}`
                          )
                        }
                      >
                        View Result
                      </button>
                    </div>
                  )
                )}
              </div>
            </>
          )}
      </div>
    </AdminLayout>
  );
};

const StatusBadge = ({ status }) => {
  const passed =
    status === "PASSED";

  return (
    <span
      className={
        passed
          ? "admin-status-passed"
          : "admin-status-failed"
      }
    >
      {status}
    </span>
  );
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
};

export default AdminAttempts;