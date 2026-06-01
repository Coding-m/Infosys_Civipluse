import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./pages/Citizen_panel/ProtectedRoute.jsx";
import 'leaflet/dist/leaflet.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// AUTH PAGES
import LoginPage from "./pages/Authentication/LoginPage.jsx";
import RegisterPage from "./pages/Authentication/RegisterPage.jsx";
import AdminSignup from "./pages/Authentication/AdminSignup.jsx";
import ForgotPassword from "./pages/Authentication/ForgotPassword.jsx";

// DASHBOARDS
import UserDashboard from "./pages/Citizen_panel/Dashboard/UserDashboard.jsx";
import OfficerDashboard from "./pages/Officer_panel/Dashboard.jsx";
import AdminDashboard from "./pages/Admin_panel/AdminDashboard.jsx";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

      <Routes>
        {/* AUTH ROUTES */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password/:role" element={<ForgotPassword />} />

        {/* ✅ Hide admin signup in production — remove or protect it */}
        {import.meta.env.DEV && (
          <Route path="/adminsignup" element={<AdminSignup />} />
        )}

        {/* CITIZEN DASHBOARD */}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* OFFICER DASHBOARD */}
        <Route
          path="/officer-dashboard"
          element={
            <ProtectedRoute allowedRoles={["OFFICER"]}>
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ 404 — redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;