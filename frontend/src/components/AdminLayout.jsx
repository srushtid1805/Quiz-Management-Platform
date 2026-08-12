import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    navigate("/admin/login");
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",

    padding: "12px 16px",
    marginBottom: "8px",

    borderRadius: "8px",

    textDecoration: "none",

    color: isActive
      ? "white"
      : "#d1d5db",

    background: isActive
      ? "#2563eb"
      : "transparent",

    fontWeight: isActive
      ? "600"
      : "500"
  });

  return (
    <div className="admin-layout">

      {/* MOBILE HEADER */}
      <div className="admin-mobile-header">

        <button
          className="admin-menu-button"
          onClick={() =>
            setSidebarOpen(true)
          }
        >
          ☰
        </button>

        <strong>
          Quiz Admin
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
          className="admin-sidebar-overlay"
          onClick={closeSidebar}
        />
      )}


      {/* SIDEBAR */}
      <aside
        className={`admin-sidebar ${
          sidebarOpen
            ? "admin-sidebar-open"
            : ""
        }`}
      >

        <div className="admin-sidebar-header">

          <h2>
            Quiz Admin
          </h2>

          <button
            className="admin-sidebar-close"
            onClick={closeSidebar}
          >
            ✕
          </button>

        </div>


        {/* NAVIGATION */}
        <nav className="admin-sidebar-nav">

          <NavLink
            to="/admin/dashboard"
            style={linkStyle}
            onClick={closeSidebar}
          >
            🏠 Dashboard
          </NavLink>


          <NavLink
            to="/admin/students"
            style={linkStyle}
            onClick={closeSidebar}
          >
            👥 Students
          </NavLink>


          <NavLink
            to="/admin/categories"
            style={linkStyle}
            onClick={closeSidebar}
          >
            🗂️ Categories
          </NavLink>


          <NavLink
            to="/admin/quizzes"
            style={linkStyle}
            onClick={closeSidebar}
          >
            📝 Quizzes
          </NavLink>


          <NavLink
            to="/admin/questions"
            style={linkStyle}
            onClick={closeSidebar}
          >
            ❓ Questions
          </NavLink>


          <NavLink
            to="/admin/attempts"
            style={linkStyle}
            onClick={closeSidebar}
          >
            📊 Attempts & Results
          </NavLink>

        </nav>


        {/* PUSH LOGOUT TO BOTTOM */}
        <div style={{ flex: 1 }} />


        <button
          onClick={handleLogout}
          className="admin-logout-button"
        >
          🚪 Logout
        </button>

      </aside>


      {/* MAIN CONTENT */}
      <main className="admin-main-content">

        {children}

      </main>

    </div>
  );
};

export default AdminLayout;