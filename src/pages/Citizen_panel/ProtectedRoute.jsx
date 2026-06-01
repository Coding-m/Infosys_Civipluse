import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // ✅ Check both localStorage and sessionStorage
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const role =
    localStorage.getItem("role") || sessionStorage.getItem("role");

  // ✅ Not logged in — redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // ✅ Role check — if allowedRoles specified, verify user has permission
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // ✅ Redirect to correct dashboard based on their actual role
    if (role === "CITIZEN") return <Navigate to="/user-dashboard" replace />;
    if (role === "OFFICER") return <Navigate to="/officer-dashboard" replace />;
    if (role === "ADMIN")   return <Navigate to="/admin-dashboard" replace />;

    // ✅ Unknown role — clear both storages and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;