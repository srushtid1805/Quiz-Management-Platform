import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

const AdminQuestions = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");

  const [formData, setFormData] = useState({
    questionText: "",
    marks: 1,
    explanation: "",
    difficulty: "BEGINNER",
    options: [
      { optionText: "", isCorrect: true },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false }
    ]
  });

  const [editingId, setEditingId] = useState(null);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await api.get("/quizzes", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setQuizzes(response.data.quizzes);
    } catch (error) {
      console.error("Failed to load quizzes:", error);
    }
  };

  const fetchQuestions = async (quizId) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await api.get(`/quizzes/${quizId}/questions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setQuestions(response.data.questions);
    } catch (error) {
      console.error("Failed to load questions:", error);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...formData.options];

    updatedOptions[index] = {
      ...updatedOptions[index],
      optionText: value
    };

    setFormData({
      ...formData,
      options: updatedOptions
    });
  };

  const handleCorrectOption = (selectedIndex) => {
    const updatedOptions = formData.options.map((option, index) => ({
      ...option,
      isCorrect: index === selectedIndex
    }));

    setFormData({
      ...formData,
      options: updatedOptions
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedQuizId) {
      alert("Please select a quiz first");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");

      if (editingId) {
        await api.put(
          `/questions/${editingId}`,
          {
            questionText: formData.questionText,
            marks: Number(formData.marks),
            explanation: formData.explanation,
            difficulty: formData.difficulty
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } else {
        await api.post(
          `/quizzes/${selectedQuizId}/questions`,
          {
            questionText: formData.questionText,
            marks: Number(formData.marks),
            explanation: formData.explanation,
            difficulty: formData.difficulty,
            options: formData.options
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }

      resetForm();

      fetchQuestions(selectedQuizId);
    } catch (error) {
      alert(error.response?.data?.message || "Question operation failed");
    }
  };

  const resetForm = () => {
    setFormData({
      questionText: "",
      marks: 1,
      explanation: "",
      difficulty: "BEGINNER",
      options: [
        { optionText: "", isCorrect: true },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false }
      ]
    });

    setEditingId(null);
  };

  const handleEdit = (question) => {
    setFormData({
      questionText: question.question_text,
      marks: question.marks,
      explanation: question.explanation || "",
      difficulty: question.difficulty,

      options: question.options.map((option) => ({
        optionText: option.option_text,
        isCorrect: option.is_correct
      }))
    });

    setEditingId(question.id);
  };

  const handleDelete = async (questionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("adminToken");

      await api.delete(`/questions/${questionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchQuestions(selectedQuizId);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete question");
    }
  };

  return (
    <AdminLayout>
      <h1>Questions Management</h1>

      <p style={{ color: "#6b7280" }}>Select a quiz to manage its questions.</p>

      <select
        value={selectedQuizId}
        onChange={(e) => {
          const quizId = e.target.value;

          setSelectedQuizId(quizId);

          if (quizId) {
            fetchQuestions(quizId);
          } else {
            setQuestions([]);
          }
        }}
        style={{
          marginTop: "20px",
          padding: "10px",
          minWidth: "250px"
        }}
      >
        <option value="">Select Quiz</option>

        {quizzes.map((quiz) => (
          <option key={quiz.id} value={quiz.id}>
            {quiz.title}
          </option>
        ))}
      </select>

      {/* ADD / EDIT QUESTION FORM */}
      {selectedQuizId && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: "white",
            padding: "20px",
            marginTop: "25px",
            borderRadius: "10px"
          }}
        >
          <h2>{editingId ? "Edit Question" : "Add Question"}</h2>

          <input
            type="text"
            name="questionText"
            placeholder="Enter question"
            value={formData.questionText}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "12px"
            }}
          />

          <input
            type="number"
            name="marks"
            min="1"
            placeholder="Marks"
            value={formData.marks}
            onChange={handleChange}
            required
            style={{
              padding: "10px",
              marginBottom: "12px"
            }}
          />

          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            style={{
              padding: "10px",
              marginLeft: "10px"
            }}
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>

          <textarea
            name="explanation"
            placeholder="Explanation"
            value={formData.explanation}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              display: "block"
            }}
          />

          <h3>Options</h3>

          {formData.options.map((option, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px"
              }}
            >
              <input
                type="radio"
                name="correctOption"
                checked={option.isCorrect}
                onChange={() => handleCorrectOption(index)}
              />

              <input
                type="text"
                placeholder={`Option ${index + 1}`}
                value={option.optionText}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required
                style={{
                  flex: 1,
                  padding: "10px"
                }}
              />
            </div>
          ))}

          <button
            type="submit"
            style={{
              padding: "10px 18px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            {editingId ? "Update Question" : "Add Question"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: "10px 18px",
                marginLeft: "10px",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>
      )}

      {/* EMPTY STATE */}
      {selectedQuizId && questions.length === 0 && (
        <div
          style={{
            marginTop: "25px",
            background: "white",
            padding: "20px",
            borderRadius: "10px"
          }}
        >
          No questions found for this quiz.
        </div>
      )}

      {/* QUESTIONS LIST */}
      {questions.length > 0 && (
        <div style={{ marginTop: "25px" }}>
          {questions.map((question, index) => (
            <div
              key={question.id}
              style={{
                background: "white",
                padding: "20px",
                marginBottom: "20px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
              }}
            >
              <h3>
                {index + 1}. {question.question_text}
              </h3>

              <p>
                <strong>Marks:</strong> {question.marks}
              </p>

              <p>
                <strong>Difficulty:</strong> {question.difficulty}
              </p>

              <div style={{ marginTop: "15px" }}>
                {question.options.map((option) => (
                  <div
                    key={option.id}
                    style={{
                      padding: "8px 12px",
                      marginBottom: "6px",
                      borderRadius: "6px",
                      background: option.is_correct ? "#dcfce7" : "#f3f4f6",
                      color: "#111827"
                    }}
                  >
                    {option.option_text}

                    {option.is_correct && (
                      <strong
                        style={{
                          color: "#16a34a",
                          marginLeft: "8px"
                        }}
                      >
                        ✓ Correct
                      </strong>
                    )}
                  </div>
                ))}
              </div>

              {question.explanation && (
                <p style={{ marginTop: "15px" }}>
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              )}

              {/* EDIT + DELETE */}
              <div style={{ marginTop: "15px" }}>
                <button
                  onClick={() => handleEdit(question)}
                  style={{
                    padding: "7px 12px",
                    marginRight: "8px",
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
                  onClick={() => handleDelete(question.id)}
                  style={{
                    padding: "7px 12px",
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminQuestions;
