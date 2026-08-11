import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const StudentLayout = ({ children }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const student = JSON.parse(
    localStorage.getItem("studentUser") || "{}"
  );

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentUser");

    navigate("/student/login");
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    marginBottom: "8px",
    borderRadius: "10px",
    textDecoration: "none",

    color: isActive
      ? "#5b3fd6"
      : "#4b5563",

    background: isActive
      ? "#f0edff"
      : "transparent",

    fontWeight: isActive
      ? "600"
      : "500"
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f7fc"
      }}
    >
      {/* MOBILE TOP BAR */}
      <div className="student-mobile-header">
        <button
          onClick={() =>
            setSidebarOpen(true)
          }
          className="student-menu-button"
        >
          ☰
        </button>

        <strong
          style={{
            color: "#4f3cc9",
            fontSize: "20px"
          }}
        >
          QuizMaster
        </strong>

        <div
          style={{
            width: "40px"
          }}
        />
      </div>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="student-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`student-sidebar ${
          sidebarOpen
            ? "student-sidebar-open"
            : ""
        }`}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "35px"
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#4f3cc9"
              }}
            >
              QuizMaster
            </h2>

            <small
              style={{
                color: "#9ca3af"
              }}
            >
              Learn • Practice • Master
            </small>
          </div>

          <button
            onClick={closeSidebar}
            className="student-sidebar-close"
          >
            ✕
          </button>
        </div>

        <NavLink
          to="/student/dashboard"
          style={linkStyle}
          onClick={closeSidebar}
        >
          🏠 Dashboard
        </NavLink>

        <NavLink
          to="/student/quizzes"
          style={linkStyle}
          onClick={closeSidebar}
        >
          📝 My Quizzes
        </NavLink>

        <NavLink
          to="/student/history"
          style={linkStyle}
          onClick={closeSidebar}
        >
          📊 Attempt History
        </NavLink>

        <NavLink
          to="/student/profile"
          style={linkStyle}
          onClick={closeSidebar}
        >
          👤 Profile
        </NavLink>

        <div style={{ flex: 1 }} />

        <div
          style={{
            padding: "14px",
            background: "#f8f7ff",
            borderRadius: "12px",
            marginBottom: "15px"
          }}
        >
          <strong>
            {student.name || "Student"}
          </strong>

          <p
            style={{
              margin: "4px 0 0",
              color: "#9ca3af",
              fontSize: "13px"
            }}
          >
            Keep learning 🚀
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "11px",
            border:
              "1px solid #fecaca",
            background: "#fff",
            color: "#dc2626",
            borderRadius: "10px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="student-main">
        {children}
      </main>
    </div>
  );
};

export default StudentLayout;