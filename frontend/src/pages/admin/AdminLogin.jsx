import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      const response = await api.post("/admin/auth/login", formData);

      const { token, user } = response.data;

      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(user));

      navigate("/admin/dashboard", { replace: true });
      
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">
        {/* BRAND */}
        <div className="admin-auth-brand">
          <div className="admin-auth-logo">🛡️</div>

          <h1>Admin Portal</h1>

          <p>Secure access to QuizMaster management.</p>
        </div>

        {/* ERROR */}
        {error && <div className="admin-auth-error">{error}</div>}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="admin-auth-form">
          <div className="admin-auth-field">
            <label>Admin Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter admin email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-auth-field">
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
            disabled={loading}
            className="admin-auth-submit"
          >
            {loading ? "Logging in..." : "Login as Admin"}
          </button>
        </form>

        <p className="admin-auth-helper">🔐 Authorized administrators only</p>
      </div>
    </div>
  );
};

export default AdminLogin;
