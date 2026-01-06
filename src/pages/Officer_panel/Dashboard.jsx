import React, { useEffect, useState } from "react";
import { Moon, Sun, Search, LayoutGrid } from "lucide-react";
import axios from "axios";
import { useThemePreference } from "../../hooks/useThemePreference.js";

import Sidebar from "./Sidebar";
import SummaryCards from "./SummaryCards";
import RecentComplaintsTable from "./RecentComplaintsTable";
import AllComplaintsCards from "./AllComplaintsCards";
import UpdateGrievanceModal from "./UpdateGrievanceModal";
import EditProfile from "./ProfileDetaills";
import OfficerFeedback from "./Feedback/OfficerFeedback";
import { Box } from "@mui/material";

const OfficerDashboard = () => {
  const { theme, toggleTheme } = useThemePreference();
  const [selected, setSelected] = useState("Dashboard");
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filters, setFilters] = useState({
    status: "All",
    priority: "All",
    category: "All",
  });

  useEffect(() => {
    const fetchComplaints = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:8081/api/officer/complaints",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaints(res.data);
    };
    fetchComplaints();
  }, []);

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedComplaint(null);
  };

  const countByStatus = (status) =>
    complaints.filter((c) => c.status === status).length;

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filters.status === "All" || c.status === filters.status;
    const matchesPriority =
      filters.priority === "All" || c.priority === filters.priority;
    const matchesCategory =
      filters.category === "All" || c.category === filters.category;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const summaryCounts = [
    { label: "Pending", value: countByStatus("PENDING"), color: "#ff9800" },
    { label: "Escalated", value: countByStatus("ESCALATED"), color: "#f44336" },
    { label: "In Progress", value: countByStatus("IN_PROGRESS"), color: "#2196f3" },
    { label: "Resolved", value: countByStatus("RESOLVED"), color: "#4caf50" },
  ];

  return (
    <div className="dashboard-shell">
      <Sidebar selected={selected} setSelected={setSelected} />

      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-header-title">{selected}</h1>

          <div className="dashboard-header-actions">
            <button type="button" className="theme-toggle" onClick={toggleTheme}>
              {theme === "dark" ? <Sun /> : <Moon />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>
        </header>

        <div className="dashboard-body">
          {selected === "Dashboard" && (
            <>
              <Box sx={{ mb: 4 }}>
                <SummaryCards counts={summaryCounts} />
              </Box>

              <Box sx={{
                display: "flex",
                gap: "1.5rem",
                flexWrap: "wrap",
                mb: 4,
                p: 3,
                background: "var(--surface)",
                borderRadius: "24px",
                border: "1px solid var(--border-soft)",
                boxShadow: "var(--card-shadow)"
              }}>
                <div style={{ position: "relative", flex: 1, minWidth: "300px" }}>
                  <Search size={20} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    placeholder="Search for complaints..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      padding: "0.8rem 1rem 0.8rem 2.8rem",
                      borderRadius: "14px",
                      border: "1px solid var(--border)",
                      background: "rgba(0,0,0,0.02)",
                      color: "var(--text-primary)",
                      fontSize: "0.95rem",
                      width: "100%",
                      outline: "none",
                      transition: "all 0.2s ease"
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  {[
                    { key: "status", options: ["All Status", "PENDING", "IN_PROGRESS", "RESOLVED", "ESCALATED"] },
                    { key: "priority", options: ["All Priority", "LOW", "MEDIUM", "HIGH"] }
                  ].map(filter => (
                    <select
                      key={filter.key}
                      value={filters[filter.key]}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      style={{
                        padding: "0.8rem 1rem",
                        borderRadius: "14px",
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                        color: "var(--text-primary)",
                        fontSize: "0.95rem",
                        outline: "none",
                        cursor: "pointer"
                      }}
                    >
                      {filter.options.map(opt => (
                        <option key={opt} value={opt === "All Status" || opt === "All Priority" ? "All" : opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>
              </Box>

              <RecentComplaintsTable complaints={filteredComplaints.slice(0, 5)} />
            </>
          )}

          {selected === "All Complaints" && (
            <AllComplaintsCards
              complaints={filteredComplaints}
              onViewDetails={handleViewDetails}
            />
          )}

          {selected === "Profile" && <EditProfile />}

          {selected === "Feedback" && <OfficerFeedback />}

          {modalOpen && (
            <UpdateGrievanceModal
              complaint={selectedComplaint}
              onClose={handleModalClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
