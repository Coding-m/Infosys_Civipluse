import React, { useEffect, useState, useCallback } from "react";
import { Moon, Sun, Search } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ Added for auth guard
import { useThemePreference } from "../../hooks/useThemePreference.js";
import api from "../../api/axios.js"; // ✅ Use configured axios instance

import Sidebar from "./Sidebar";
import SummaryCards from "./SummaryCards";
import RecentComplaintsTable from "./RecentComplaintsTable";
import AllComplaintsCards from "./AllComplaintsCards";
import UpdateGrievanceModal from "./UpdateGrievanceModal";
import EditProfile from "./ProfileDetaills";
import OfficerFeedback from "./Feedback/OfficerFeedback";

const Dashboard = () => {
  const { theme, toggleTheme } = useThemePreference();
  const navigate = useNavigate();

  const [selected, setSelected]                   = useState("Dashboard");
  const [complaints, setComplaints]               = useState([]);
  const [search, setSearch]                       = useState("");
  const [loading, setLoading]                     = useState(false); // ✅ Added
  const [error, setError]                         = useState(null);  // ✅ Added
  const [modalOpen, setModalOpen]                 = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filters]                                 = useState({
    status: "All", priority: "All", category: "All",
  });

  // ✅ Read from both storages
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const role  = localStorage.getItem("role")  || sessionStorage.getItem("role");

  // ✅ Auth guard
  useEffect(() => {
    if (!token || role !== "OFFICER") {
      navigate("/", { replace: true });
    }
  }, [token, role, navigate]);

  // ✅ Image normalizer — Cloudinary URLs start with https
  // Local /uploads/ paths no longer exist — return null for them
  const normalizeImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("https://")) return imageUrl; // ✅ Cloudinary URL
    return null; // ✅ Old local paths — no longer valid
  };

  // ── Fetch Complaints ──────────────────────────────────────────────────────
  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Use api instance — no manual token needed
      const res = await api.get("/api/officer/complaints");

      const fixedData = res.data.map((c) => ({
        ...c,
        imageUrl: normalizeImageUrl(c.imageUrl),
        officerEvidenceUrl: normalizeImageUrl(c.officerEvidenceUrl),
      }));

      setComplaints(Array.isArray(fixedData) ? fixedData : []);

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
    if (token && role === "OFFICER") {
      fetchComplaints();
    }
  }, [fetchComplaints, token, role]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedComplaint(null);
  };

  // ── Derived State ─────────────────────────────────────────────────────────
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
    { label: "Escalated",   value: countByStatus("ESCALATED"),   color: "#f44336" },
    { label: "In Progress", value: countByStatus("IN_PROGRESS"), color: "#2196f3" },
    { label: "Resolved",    value: countByStatus("RESOLVED"),    color: "#4caf50" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-shell">
      <Sidebar selected={selected} setSelected={setSelected} />

      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-header-title">{selected}</h1>
          <div className="dashboard-header-actions">
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
            <>
              <SummaryCards counts={summaryCounts} />

              {/* ✅ Error with retry */}
              {error && (
                <div style={{ color: "var(--accent)", padding: "1rem", marginBottom: "1rem" }}>
                  {error}
                  <button
                    onClick={fetchComplaints}
                    style={{ marginLeft: "0.5rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}
                  >
                    Retry
                  </button>
                </div>
              )}

              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", margin: "2rem 0", padding: "1.5rem", background: "var(--surface)", borderRadius: "24px", border: "1px solid var(--border-soft)" }}>
                <div style={{ position: "relative", flex: 1, minWidth: "300px" }}>
                  <Search size={20} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    placeholder="Search complaints..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      padding: "0.8rem 1rem 0.8rem 2.8rem",
                      borderRadius: "14px",
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      color: "var(--text-primary)",
                      fontSize: "0.95rem",
                      width: "100%",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* ✅ Refresh button */}
                <button
                  type="button"
                  onClick={fetchComplaints}
                  disabled={loading}
                  style={{
                    padding: "0.8rem 1.5rem",
                    borderRadius: "14px",
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text-primary)",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Loading..." : "↻ Refresh"}
                </button>
              </div>

              <RecentComplaintsTable
                complaints={filteredComplaints.slice(0, 5)}
                loading={loading}
              />
            </>
          )}

          {selected === "All Complaints" && (
            <AllComplaintsCards
              complaints={filteredComplaints}
              onViewDetails={handleViewDetails}
              loading={loading}
            />
          )}

          {selected === "Profile"  && <EditProfile />}
          {selected === "Feedback" && <OfficerFeedback />}
        </div>
      </div>

      <UpdateGrievanceModal
        open={modalOpen}
        grievance={selectedComplaint}
        onClose={handleModalClose}
        onSubmit={fetchComplaints}
      />
    </div>
  );
};

export default Dashboard;