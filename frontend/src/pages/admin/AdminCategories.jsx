import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const [editingId, setEditingId] = useState(null);

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
      console.error(error);
    }
  };

  useEffect(() => {
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

      if (editingId) {
        await api.put(`/categories/${editingId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        await api.post("/categories", formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      setFormData({
        name: "",
        description: ""
      });

      setEditingId(null);

      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || "Category operation failed");
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description
    });

    setEditingId(category.id);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("adminToken");

      await api.delete(`/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <AdminLayout>
      <h1>Categories Management</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "20px",
          marginTop: "20px",
          marginBottom: "30px",
          borderRadius: "10px"
        }}
      >
        <input
          type="text"
          name="name"
          placeholder="Category Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{
            padding: "10px",
            marginRight: "10px"
          }}
        />

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
          style={{
            padding: "10px",
            marginRight: "10px"
          }}
        />

        <button
          type="submit"
          style={{
            padding: "10px 16px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          {editingId ? "Update Category" : "Add Category"}
        </button>
      </form>

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
            <th style={cellStyle}>Name</th>
            <th style={cellStyle}>Description</th>
            <th style={cellStyle}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((category, index) => (
            <tr key={category.id}>
              <td style={cellStyle}>{index + 1}</td>

              <td style={cellStyle}>{category.name}</td>

              <td style={cellStyle}>{category.description}</td>

              <td style={cellStyle}>
                <button
                  onClick={() => handleEdit(category)}
                  style={{
                    marginRight: "8px",
                    padding: "7px 12px",
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
                  onClick={() => handleDelete(category.id)}
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
};

const cellStyle = {
  padding: "14px",
  borderBottom: "1px solid #e5e7eb",
  textAlign: "left"
};

export default AdminCategories;
