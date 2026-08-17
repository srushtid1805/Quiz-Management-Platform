import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";

const StudentRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await api.post(
        "/auth/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password
        }
      );

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/student/login");
      }, 1200);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-auth-page">
      <div className="student-auth-card">

        <div className="student-auth-brand">
          <div className="student-auth-logo">
            🎓
          </div>

          <h1>Create Account</h1>

          <p>
            Join QuizMaster and start your
            learning journey.
          </p>
        </div>


        {error && (
          <div className="student-auth-error">
            {error}
          </div>
        )}


        {success && (
          <div className="student-auth-success">
            {success}
          </div>
        )}


        <form
          onSubmit={handleSubmit}
          className="student-auth-form"
        >

          <div className="student-auth-field">
            <label>
              Full Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>


          <div className="student-auth-field">
            <label>
              Email Address
            </label>

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
            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              minLength="6"
              required
            />
          </div>


          <div className="student-auth-field">
            <label>
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={
                formData.confirmPassword
              }
              onChange={handleChange}
              minLength="6"
              required
            />
          </div>


          <button
            type="submit"
            className="student-auth-submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>


        <p className="student-auth-switch">
          Already have an account?{" "}

          <Link to="/student/login">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default StudentRegister;