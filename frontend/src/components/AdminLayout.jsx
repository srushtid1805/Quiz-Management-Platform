import { NavLink, useNavigate } from "react-router-dom";

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        navigate("/admin/login");
    };

    const linkStyle = ({ isActive }) => ({
        display: "block",
        padding: "12px 16px",
        marginBottom: "8px",
        borderRadius: "8px",
        textDecoration: "none",
        color: isActive ? "white" : "#d1d5db",
        background: isActive ? "#2563eb" : "transparent",
    });

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                background: "#f3f4f6",
            }}
        >
            <aside
                style={{
                    width: "240px",
                    background: "#111827",
                    padding: "24px 16px",
                    color: "white",
                }}
            >
                <h2 style={{ marginBottom: "30px" }}>
                    Quiz Admin
                </h2>

                <NavLink
                    to="/admin/dashboard"
                    style={linkStyle}
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/admin/students"
                    style={linkStyle}
                >
                    Students
                </NavLink>

                <NavLink
                    to="/admin/categories"
                    style={linkStyle}
                >
                    Categories
                </NavLink>

                <NavLink
                    to="/admin/quizzes"
                    style={linkStyle}
                >
                    Quizzes
                </NavLink>

                <NavLink
                    to="/admin/questions"
                    style={linkStyle}
                >
                    Questions
                </NavLink>

                <button
                    onClick={handleLogout}
                    style={{
                        width: "100%",
                        marginTop: "30px",
                        padding: "12px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        background: "#dc2626",
                        color: "white",
                    }}
                >
                    Logout
                </button>
            </aside>

            <main
                style={{
                    flex: 1,
                    padding: "30px",
                    color: "#111827",
                }}
            >
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;