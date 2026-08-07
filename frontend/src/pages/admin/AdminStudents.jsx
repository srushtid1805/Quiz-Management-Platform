import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await api.get("/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setStudents(response.data.students);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (student) => {
    try {
      const token = localStorage.getItem("adminToken");

      const newStatus = student.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      await api.patch(
        `/users/${student.id}/status`,
        {
          status: newStatus
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update student status");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");

      await api.delete(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete student");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <AdminLayout>
      <h1>Students Management</h1>

      <p style={{ color: "#6b7280" }}>
        Manage registered students and their account status.
      </p>

      {loading && <p>Loading students...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && students.length === 0 && (
        <div
          style={{
            background: "white",
            padding: "30px",
            marginTop: "25px",
            borderRadius: "10px"
          }}
        >
          <p>No students found.</p>
        </div>
      )}

      {!loading && students.length > 0 && (
        <div
          style={{
            marginTop: "25px",
            overflowX: "auto"
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white"
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#111827",
                  color: "white"
                }}
              >
                <th style={cellStyle}>ID</th>
                <th style={cellStyle}>Name</th>
                <th style={cellStyle}>Email</th>
                <th style={cellStyle}>Status</th>
                <th style={cellStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td style={cellStyle}>{student.id}</td>

                  <td style={cellStyle}>{student.name}</td>

                  <td style={cellStyle}>{student.email}</td>

                  <td style={cellStyle}>{student.status}</td>

                  <td style={cellStyle}>
                    <button
                      onClick={() => handleStatusChange(student)}
                      style={{
                        padding: "8px 12px",
                        marginRight: "8px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        background:
                          student.status === "ACTIVE" ? "#f59e0b" : "#16a34a",
                        color: "white"
                      }}
                    >
                      {student.status === "ACTIVE" ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      onClick={() => handleDelete(student.id)}
                      style={{
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        background: "#dc2626",
                        color: "white"
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

export default AdminStudents;
