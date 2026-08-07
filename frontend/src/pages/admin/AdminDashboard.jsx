import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

const AdminDashboard = () => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem("adminToken");

                const response = await api.get(
                    "/admin/dashboard",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setStatistics(response.data.statistics);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load dashboard"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <AdminLayout>
                <h2>Loading dashboard...</h2>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <h2>{error}</h2>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <h1>Admin Dashboard</h1>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "20px",
                    marginTop: "30px",
                }}
            >
                <DashboardCard
                    title="Total Students"
                    value={statistics.total_students}
                />

                <DashboardCard
                    title="Total Quizzes"
                    value={statistics.total_quizzes}
                />

                <DashboardCard
                    title="Published Quizzes"
                    value={statistics.published_quizzes}
                />

                <DashboardCard
                    title="Draft Quizzes"
                    value={statistics.draft_quizzes}
                />

                <DashboardCard
                    title="Total Questions"
                    value={statistics.total_questions}
                />

                <DashboardCard
                    title="Total Attempts"
                    value={statistics.total_attempts}
                />

                <DashboardCard
                    title="Average Score"
                    value={`${Number(
                        statistics.average_score
                    ).toFixed(2)}%`}
                />

                <DashboardCard
                    title="Passed Attempts"
                    value={statistics.passed_attempts}
                />

                <DashboardCard
                    title="Failed Attempts"
                    value={statistics.failed_attempts}
                />
            </div>
        </AdminLayout>
    );
};

const DashboardCard = ({ title, value }) => {
    return (
        <div
            style={{
                background: "white",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
            }}
        >
            <h3>{title}</h3>

            <h2
                style={{
                    color: "#2563eb",
                    marginTop: "10px",
                }}
            >
                {value}
            </h2>
        </div>
    );
};

export default AdminDashboard;