import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminQuizzes from "./pages/admin/AdminQuizzes";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminAttemptResult from "./pages/admin/AdminAttemptResult";
import AdminAttempts from "./pages/admin/AdminAttempts";


import StudentLogin from "./pages/student/StudentLogin";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProtectedRoute from "./routes/StudentProtectedRoute";
import StudentQuizDetails from "./pages/student/StudentQuizDetails";
import StudentQuizAttempt from "./pages/student/StudentQuizAttempt";
import StudentResult from "./pages/student/StudentResult";
import StudentAttemptHistory from "./pages/student/StudentAttemptHistory";
import StudentQuizzes from "./pages/student/StudentQuizzes";
import StudentProfile from "./pages/student/StudentProfile";
import StudentRegister from "./pages/student/StudentRegister";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/student/login" replace />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
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
        <Route path="/student/login" element={<StudentLogin />} />

        <Route
          path="/student/dashboard"
          element={
            <StudentProtectedRoute>
              <StudentDashboard />
            </StudentProtectedRoute>
          }
        />

        <Route
          path="/student/quizzes/:quizId"
          element={
            <StudentProtectedRoute>
              <StudentQuizDetails />
            </StudentProtectedRoute>
          }
        />

        <Route
          path="/student/attempts/:attemptId"
          element={
            <StudentProtectedRoute>
              <StudentQuizAttempt />
            </StudentProtectedRoute>
          }
        />

        <Route
          path="/student/attempts/:attemptId/result"
          element={
            <StudentProtectedRoute>
              <StudentResult />
            </StudentProtectedRoute>
          }
        />

        <Route
          path="/student/history"
          element={
            <StudentProtectedRoute>
              <StudentAttemptHistory />
            </StudentProtectedRoute>
          }
        />

        <Route
          path="/student/quizzes"
          element={
            <StudentProtectedRoute>
              <StudentQuizzes />
            </StudentProtectedRoute>
          }
        />

        <Route
          path="/student/profile"
          element={
            <StudentProtectedRoute>
              <StudentProfile />
            </StudentProtectedRoute>
          }
        />

        <Route
          path="/admin/attempts"
          element={
            <AdminProtectedRoute>
              <AdminAttempts />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/attempts/:attemptId"
          element={
            <AdminProtectedRoute>
              <AdminAttemptResult />
            </AdminProtectedRoute>
          }
        />

        <Route path="/student/register" element={<StudentRegister />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
