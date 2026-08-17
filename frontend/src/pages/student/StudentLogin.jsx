import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";

const StudentLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/login", formData);

      const { token, user } = response.data;

      if (user.role !== "STUDENT") {
        setError("This login is only for students.");
        return;
      }

      localStorage.setItem("studentToken", token);

      localStorage.setItem("studentUser", JSON.stringify(user));

      navigate("/student/dashboard", { replace: true });
      
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-auth-page">
      <div className="student-auth-card">
        {/* BRAND */}
        <div className="student-auth-brand">
          <div className="student-auth-logo">🎓</div>

          <h1>Welcome Back</h1>

          <p>Login to continue your learning journey with QuizMaster.</p>
        </div>

        {/* ERROR */}
        {error && <div className="student-auth-error">{error}</div>}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="student-auth-form">
          <div className="student-auth-field">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="student-auth-field">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="student-auth-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* REGISTER */}
        <p className="student-auth-switch">
          Don't have an account?{" "}
          <Link to="/student/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;
