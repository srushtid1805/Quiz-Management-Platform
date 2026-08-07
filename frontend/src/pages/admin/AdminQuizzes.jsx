import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    difficulty: "BEGINNER",
    duration: "",
    passingScore: "",
    maxAttempts: "",
    status: "DRAFT"
  });

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await api.get("/quizzes", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setQuizzes(response.data.quizzes);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await api.get("/categories", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCategories(response.data.categories);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("adminToken");

      const payload = {
        ...formData,
        categoryId: Number(formData.categoryId),
        duration: Number(formData.duration),
        passingScore: Number(formData.passingScore),
        maxAttempts: Number(formData.maxAttempts)
      };

      if (editingId) {
        await api.put(`/quizzes/${editingId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        await api.post("/quizzes", payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      setFormData({
        title: "",
        description: "",
        categoryId: "",
        difficulty: "BEGINNER",
        duration: "",
        passingScore: "",
        maxAttempts: "",
        status: "DRAFT"
      });

      setEditingId(null);
      fetchQuizzes();
    } catch (error) {
      alert(error.response?.data?.message || "Quiz operation failed");
    }
  };

  const handleEdit = (quiz) => {
    setFormData({
      title: quiz.title,
      description: quiz.description,
      categoryId: quiz.category_id,
      difficulty: quiz.difficulty,
      duration: quiz.duration,
      passingScore: quiz.passing_score,
      maxAttempts: quiz.max_attempts,
      status: quiz.status
    });

    setEditingId(quiz.id);
  };

  const handlePublishStatus = async (quiz) => {
    try {
      const token = localStorage.getItem("adminToken");

      const newStatus =
        quiz.status === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";

      await api.patch(
        `/quizzes/${quiz.id}/publish`,
        {
          status: newStatus
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchQuizzes();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to change quiz status");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("adminToken");

      await api.delete(`/quizzes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchQuizzes();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete quiz");
    }
  };

return (
  <AdminLayout>
    <h1>Quizzes Management</h1>

    <p style={{ color: "#6b7280" }}>
      Create and manage quizzes for students.
    </p>

    {/* CREATE / EDIT QUIZ FORM */}
    <form
      onSubmit={handleSubmit}
      style={{
        background: "white",
        padding: "20px",
        marginTop: "25px",
        borderRadius: "10px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "12px"
      }}
    >
      <input
        type="text"
        name="title"
        placeholder="Quiz Title"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        required
      />

      <select
        name="categoryId"
        value={formData.categoryId}
        onChange={handleChange}
        required
      >
        <option value="">Select Category</option>

        {categories.map((category) => (
          <option
            key={category.id}
            value={category.id}
          >
            {category.name}
          </option>
        ))}
      </select>

      <select
        name="difficulty"
        value={formData.difficulty}
        onChange={handleChange}
      >
        <option value="BEGINNER">
          Beginner
        </option>

        <option value="INTERMEDIATE">
          Intermediate
        </option>

        <option value="ADVANCED">
          Advanced
        </option>
      </select>

      <input
        type="number"
        name="duration"
        placeholder="Duration (minutes)"
        value={formData.duration}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="passingScore"
        placeholder="Passing Score %"
        value={formData.passingScore}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="maxAttempts"
        placeholder="Max Attempts"
        value={formData.maxAttempts}
        onChange={handleChange}
        required
      />

      {/* <select
        name="status"
        value={formData.status}
        onChange={handleChange}
      >
        <option value="DRAFT">
          Draft
        </option>

        <option value="PUBLISHED">
          Published
        </option>
      </select> */}

      <button
        type="submit"
        style={{
          padding: "10px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        {editingId ? "Update Quiz" : "Create Quiz"}
      </button>
    </form>

    {/* LOADING */}
    {loading && (
      <p style={{ marginTop: "25px" }}>
        Loading quizzes...
      </p>
    )}

    {/* ERROR */}
    {error && (
      <p
        style={{
          color: "red",
          marginTop: "25px"
        }}
      >
        {error}
      </p>
    )}

    {/* EMPTY STATE */}
    {!loading && !error && quizzes.length === 0 && (
      <div
        style={{
          background: "white",
          padding: "30px",
          marginTop: "25px",
          borderRadius: "10px"
        }}
      >
        No quizzes found.
      </div>
    )}

    {/* QUIZZES TABLE */}
    {!loading && !error && quizzes.length > 0 && (
      <div
        style={{
          marginTop: "25px",
          overflowX: "auto"
        }}
      >
        <table
          style={{
            width: "100%",
            background: "white",
            borderCollapse: "collapse"
          }}
        >
          <thead>
            <tr
              style={{
                background: "#111827",
                color: "white"
              }}
            >
              <th style={cellStyle}>Sr. No.</th>
              <th style={cellStyle}>Title</th>
              <th style={cellStyle}>Category</th>
              <th style={cellStyle}>Difficulty</th>
              <th style={cellStyle}>Duration</th>
              <th style={cellStyle}>Passing Score</th>
              <th style={cellStyle}>Max Attempts</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {quizzes.map((quiz, index) => (
              <tr key={quiz.id}>
                <td style={cellStyle}>
                  {index + 1}
                </td>

                <td style={cellStyle}>
                  {quiz.title}
                </td>

                <td style={cellStyle}>
                  {quiz.category_name}
                </td>

                <td style={cellStyle}>
                  {quiz.difficulty}
                </td>

                <td style={cellStyle}>
                  {quiz.duration} min
                </td>

                <td style={cellStyle}>
                  {quiz.passing_score}%
                </td>

                <td style={cellStyle}>
                  {quiz.max_attempts}
                </td>

                <td style={cellStyle}>
                  {quiz.status}
                </td>

                <td style={cellStyle}>
                  <button
                    onClick={() => handleEdit(quiz)}
                    style={{
                      marginRight: "8px",
                      padding: "7px 10px",
                      background: "#f59e0b",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer"
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handlePublishStatus(quiz)
                    }
                    style={{
                      marginRight: "8px",
                      padding: "7px 10px",
                      background:
                        quiz.status === "PUBLISHED"
                          ? "#6b7280"
                          : "#16a34a",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer"
                    }}
                  >
                    {quiz.status === "PUBLISHED"
                      ? "Unpublish"
                      : "Publish"}
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(quiz.id)
                    }
                    style={{
                      padding: "7px 10px",
                      background: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </AdminLayout>
);
};

const cellStyle = {
  padding: "14px",
  borderBottom: "1px solid #e5e7eb",
  textAlign: "left"
};

export default AdminQuizzes;
