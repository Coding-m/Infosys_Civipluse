import React, { useEffect, useState, useCallback } from "react";
import { Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ Added for auth guard
import { useThemePreference } from "../../hooks/useThemePreference.js";

import AdminSidebar from "../Admin_panel/AdminSidebar";
import AdminSummaryCards from "../Admin_panel/AdminSummary";
import RecentComplaintsTable from "./RecentComplaintsTable";
import CreateOfficerForm from "./AdminCreateOfficer";
import AllComplaints from "../Admin_panel/AllComplaints";
import AdminAnalytics from "../Admin_panel/AdminAnalytics";
import AdminFeedback from "../Admin_panel/Feedback/AdminFeedback";
import AdminProfile from "../Admin_panel/AdminProfile";
import AdminNotifications from "../Admin_panel/AdminNotificationList";
import AdminOfficerRequest from "./AdminOfficerRequest";

import { fetchAdminComplaints } from "../../api/admin";
import useAdminWebSocket from "../../hooks/useAdminWebSocket"; // ✅ Use hook

export default function AdminDashboard() {
  const { theme, toggleTheme } = useThemePreference();
  const navigate = useNavigate();

  const [selected, setSelected]     = useState("Dashboard");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(false); // ✅ Added loading state
  const [error, setError]           = useState(null);  // ✅ Added error state
  const [search, setSearch]         = useState("");
  const [filters, setFilters]       = useState({
    status: "All", priority: "All", category: "All",
  });

  // ✅ Read from both storages
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const role  = localStorage.getItem("role")  || sessionStorage.getItem("role");

  // ✅ Auth guard — redirect if not admin
  useEffect(() => {
    if (!token || role !== "ADMIN") {
      navigate("/", { replace: true });
    }
  }, [token, role, navigate]);

  // ✅ Use WebSocket hook — handles connection, reconnect, notifications
  const { notifications, deleteNotification, clearAllNotifications } =
    useAdminWebSocket();

  // ── Load Complaints ───────────────────────────────────────────────────────
  const loadComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAdminComplaints();
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err?.response?.status !== 401) {
        setError("Failed to load complaints. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Initial Fetch ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (token && role === "ADMIN") {
      loadComplaints();
    }
  }, [loadComplaints, token, role]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const countByStatus = useCallback((status) =>
    complaints.filter((c) => c.status === status).length,
  [complaints]);

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus   = filters.status   === "All" || c.status   === filters.status;
    const matchesPriority = filters.priority === "All" || c.priority === filters.priority;
    const matchesCategory = filters.category === "All" || c.category === filters.category;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const summaryCounts = [
    { label: "Pending",     value: countByStatus("PENDING"),     color: "#ff9800" },
    { label: "In Progress", value: countByStatus("IN_PROGRESS"), color: "#2196f3" },
    { label: "Resolved",    value: countByStatus("RESOLVED"),    color: "#4caf50" },
    { label: "Escalated",   value: countByStatus("ESCALATED"),   color: "#f44336" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-shell">
      <AdminSidebar selected={selected} setSelected={setSelected} />

      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-header-title">{selected}</h1>
          <div className="dashboard-header-actions">
            {/* ✅ Show notification count from WebSocket hook */}
            {notifications.length > 0 && (
              <span style={{
                background: "var(--accent)",
                color: "white",
                borderRadius: "12px",
                padding: "2px 10px",
                fontSize: "0.85rem",
                fontWeight: "600",
              }}>
                {notifications.length} new
              </span>
            )}
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>
        </header>

        <div className="dashboard-body">
          {selected === "Dashboard" && (
            <div className="dashboard-body-inner" style={{ padding: "1.5rem 2rem" }}>
              <AdminSummaryCards counts={summaryCounts} />

              {/* ✅ Show error if complaints failed to load */}
              {error && (
                <div style={{ color: "var(--accent)", padding: "1rem", marginBottom: "1rem" }}>
                  {error} <button onClick={loadComplaints} style={{ marginLeft: "0.5rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>Retry</button>
                </div>
              )}

              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", margin: "2rem 0", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1, minWidth: "300px" }}>
                  <input
                    type="text"
                    placeholder="Quick search complaints..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      width: "100%", padding: "1rem 1.5rem",
                      borderRadius: "18px", border: "1px solid var(--border)",
                      background: "var(--surface)", color: "var(--text-primary)",
                      fontSize: "1rem", outline: "none", transition: "border-color 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }}
                  />
                </div>

                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  style={{
                    padding: "1rem 1.5rem", borderRadius: "18px",
                    border: "1px solid var(--border)", background: "var(--surface)",
                    color: "var(--text-primary)", fontSize: "0.95rem",
                    fontWeight: "600", cursor: "pointer", outline: "none",
                  }}
                >
                  <option value="All">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="ESCALATED">Escalated</option>
                </select>

                {/* ✅ Refresh button */}
                <button
                  type="button"
                  onClick={loadComplaints}
                  disabled={loading}
                  style={{
                    padding: "1rem 1.5rem", borderRadius: "18px",
                    border: "1px solid var(--border)", background: "var(--surface)",
                    color: "var(--text-primary)", fontSize: "0.95rem",
                    fontWeight: "600", cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Loading..." : "↻ Refresh"}
                </button>
              </div>

              <RecentComplaintsTable
                complaints={filteredComplaints.slice(0, 8)}
                loading={loading}
              />
            </div>
          )}

          {selected === "All Complaints"  && <AllComplaints complaints={filteredComplaints} refresh={loadComplaints} />}
          {selected === "Create Officer"  && <CreateOfficerForm />}
          {selected === "OfficerRequest"  && <AdminOfficerRequest />}
          {selected === "Analytics"       && <AdminAnalytics complaints={complaints} />}
          {selected === "Notifications"   && (
            <AdminNotifications
              notifications={notifications}
              deleteNotification={deleteNotification}
              clearAll={clearAllNotifications}
            />
          )}
          {selected === "Feedback"        && <AdminFeedback />}
          {selected === "Profile"         && <AdminProfile />}
        </div>
      </div>
    </div>
  );
}