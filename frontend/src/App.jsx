import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminQuizzes from "./pages/admin/AdminQuizzes";
import AdminQuestions from "./pages/admin/AdminQuestions";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <AdminProtectedRoute>
              <AdminStudents />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <AdminProtectedRoute>
              <AdminCategories />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/quizzes"
          element={
            <AdminProtectedRoute>
              <AdminQuizzes />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/questions"
          element={
            <AdminProtectedRoute>
              <AdminQuestions />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
