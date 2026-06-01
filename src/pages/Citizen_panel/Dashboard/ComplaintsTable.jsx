import React, { useState } from "react";
import PropTypes from "prop-types";
import { Trash2, Eye, MessageSquare, Search, AlertCircle } from "lucide-react";
import { toast } from "react-toastify"; // ✅ Replace alert()
import api from "../../../api/axios"; // ✅ Use configured axios instance

const ComplaintsTable = ({
  complaints,
  loading,
  error,
  fetchComplaints,
  onFeedback,
}) => {
  const [search, setSearch]                   = useState("");
  const [modalOpen, setModalOpen]             = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [deletingId, setDeletingId]           = useState(null); // ✅ Track which item is deleting

  const handleView = (complaint) => {
    setSelectedComplaint(complaint);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedComplaint(null);
  };

  const handleDelete = async (id) => {
    // ✅ Replace globalThis.confirm with toast confirmation
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;

    setDeletingId(id);
    try {
      await api.delete(`/api/citizen/complaints/${id}`);
      toast.success("Complaint deleted successfully");
      fetchComplaints?.();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to delete complaint. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredComplaints = complaints.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "PENDING":     return { bg: "rgba(255,152,0,0.1)",   color: "#ff9800", text: "Pending" };
      case "IN_PROGRESS": return { bg: "rgba(33,150,243,0.1)",  color: "#2196f3", text: "In Progress" };
      case "RESOLVED":    return { bg: "rgba(76,175,80,0.1)",   color: "#4caf50", text: "Resolved" };
      case "REOPENED":    return { bg: "rgba(156,39,176,0.1)",  color: "#9c27b0", text: "Reopened" }; // ✅ Added
      default:            return { bg: "rgba(158,158,158,0.1)", color: "#9e9e9e", text: status || "Unknown" };
    }
  };

  const renderComplaintsList = () => {
    if (loading) {
      return (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          Loading complaints...
        </div>
      );
    }

    if (filteredComplaints.length === 0) {
      return (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          {complaints.length === 0
            ? "No complaints found. Start by submitting a new grievance!"
            : "No complaints match your search."}
        </div>
      );
    }

    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-soft)" }}>
              {["ID", "Title", "Category", "Status", "Image", "Action"].map((h) => (
                <th key={h} style={{ padding: "1rem", textAlign: h === "Action" ? "center" : "left", fontWeight: "600", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((c) => {
              const statusStyle  = getStatusStyle(c.status);
              const isDeleting   = deletingId === c.id;
              const canDelete    = c.status !== "RESOLVED" && c.status !== "IN_PROGRESS";

              return (
                <tr
                  key={c.id}
                  style={{ borderBottom: "1px solid var(--border-soft)", transition: "background 0.2s ease" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "color-mix(in srgb, var(--primary) 5%, transparent)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "1rem", color: "var(--text-primary)", fontSize: "0.95rem" }}>{c.id}</td>
                  <td style={{ padding: "1rem", color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: "500" }}>{c.title}</td>
                  <td style={{ padding: "1rem", color: "var(--text-primary)", fontSize: "0.95rem" }}>{c.category || "—"}</td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ display: "inline-block", padding: "0.5rem 1rem", borderRadius: "999px", backgroundColor: statusStyle.bg, color: statusStyle.color, fontSize: "0.85rem", fontWeight: "600" }}>
                      {statusStyle.text}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {/* ✅ Cloudinary URL — no BACKEND_URL prefix needed */}
                    {c.imageUrl && c.imageUrl.startsWith("https://") ? (
                      <img
                        src={c.imageUrl}
                        alt="complaint evidence"
                        style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 12, border: "1px solid var(--border)" }}
                        onError={(e) => { e.target.style.display = "none"; }} // ✅ Hide broken images
                      />
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
                      <ActionButton
                        onClick={() => handleView(c)}
                        icon={<Eye size={16} />}
                        label="View"
                        color="var(--primary)"
                      />

                      <ActionButton
                        onClick={() => handleDelete(c.id)}
                        icon={<Trash2 size={16} />}
                        label={isDeleting ? "Deleting..." : "Delete"}
                        color="var(--accent)"
                        disabled={!canDelete || isDeleting}
                      />

                      {c.status === "RESOLVED" && (
                        <ActionButton
                          onClick={() => onFeedback(c)}
                          icon={<MessageSquare size={16} />}
                          label={c.feedback ? "Submitted" : "Feedback"}
                          color="white"
                          background={c.feedback ? "#e5e7eb" : "linear-gradient(135deg, var(--primary), var(--primary-strong))"}
                          textColor={c.feedback ? "#6b7280" : "white"}
                          disabled={!!c.feedback}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      {/* Error Banner */}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", marginBottom: "1.5rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "14px", color: "#dc2626" }}>
          <AlertCircle size={18} aria-hidden="true" />
          <span style={{ fontSize: "0.95rem", fontWeight: "500", flex: 1 }}>{error}</span>
          <button type="button" onClick={fetchComplaints} style={{ padding: "0.35rem 0.85rem", background: "transparent", border: "1px solid #dc2626", borderRadius: "8px", color: "#dc2626", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}>
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <section aria-label="Complaints Statistics" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {[
          { label: "Total",       value: complaints.length,                                color: "var(--primary)" },
          { label: "Pending",     value: complaints.filter(c => c.status === "PENDING").length,     color: "#ff9800" },
          { label: "In Progress", value: complaints.filter(c => c.status === "IN_PROGRESS").length, color: "#2196f3" },
          { label: "Resolved",    value: complaints.filter(c => c.status === "RESOLVED").length,    color: "#4caf50" },
        ].map((stat) => (
          <article
            key={stat.label}
            style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: "20px", padding: "2rem", textAlign: "center", boxShadow: "var(--card-shadow)" }}
          >
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>
              {stat.label}
            </h3>
            <p style={{ margin: 0, fontSize: "2.5rem", fontWeight: "700", color: stat.color }}>
              {stat.value}
            </p>
          </article>
        ))}
      </section>

      {/* Search */}
      <div style={{ marginBottom: "2rem" }}>
        <label htmlFor="complaint-search" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>
          Search Complaints
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "0.75rem 1rem" }}>
          <Search size={20} color="var(--text-muted)" aria-hidden="true" />
          <input
            id="complaint-search"
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, border: "none", background: "transparent", color: "var(--text-primary)", fontSize: "1rem", outline: "none", fontFamily: "inherit" }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", borderRadius: "20px", border: "1px solid var(--border-soft)", overflow: "hidden", boxShadow: "var(--card-shadow)" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-soft)" }}>
          <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700", color: "var(--text-primary)" }}>
            Your Complaints ({filteredComplaints.length})
          </h3>
        </div>
        {renderComplaintsList()}
      </div>

      {/* Modal */}
      {modalOpen && selectedComplaint && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Complaint Details"
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "2rem" }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }} // ✅ Close on backdrop click
        >
          <div style={{ background: "var(--surface)", borderRadius: "24px", padding: "2rem", maxWidth: 600, width: "100%", maxHeight: "85vh", overflowY: "auto", border: "1px solid var(--border-soft)", boxShadow: "0 50px 100px rgba(0,0,0,0.3)" }}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)" }}>
              {selectedComplaint.title}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Status</div>
                <span style={{ display: "inline-block", padding: "0.5rem 1rem", borderRadius: "999px", backgroundColor: getStatusStyle(selectedComplaint.status).bg, color: getStatusStyle(selectedComplaint.status).color, fontSize: "0.85rem", fontWeight: "600" }}>
                  {getStatusStyle(selectedComplaint.status).text}
                </span>
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Category</div>
                <div style={{ fontSize: "1rem", color: "var(--text-primary)", fontWeight: "500" }}>{selectedComplaint.category || "—"}</div>
              </div>
            </div>

            {selectedComplaint.description && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Description</div>
                <p style={{ margin: 0, color: "var(--text-primary)", lineHeight: 1.6 }}>{selectedComplaint.description}</p>
              </div>
            )}

            {/* ✅ Cloudinary image — no BACKEND_URL prefix */}
            {selectedComplaint.imageUrl && selectedComplaint.imageUrl.startsWith("https://") && (
              <div style={{ marginBottom: "1.5rem" }}>
                <img
                  src={selectedComplaint.imageUrl}
                  alt="complaint evidence"
                  style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 16, border: "1px solid var(--border)" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleCloseModal}
              style={{ width: "100%", padding: "0.75rem 1rem", background: "linear-gradient(135deg, var(--primary), var(--primary-strong))", color: "white", border: "none", borderRadius: "14px", fontSize: "1rem", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// ✅ Reusable action button
const ActionButton = ({ onClick, icon, label, color, background, textColor, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: "0.5rem 1rem",
      background: background || "transparent",
      border: background ? "none" : `1px solid ${color}`,
      borderRadius: "10px",
      color: textColor || color,
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: "0.85rem",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "0.4rem",
      opacity: disabled ? 0.5 : 1,
      fontFamily: "inherit",
      transition: "all 0.2s ease",
    }}
  >
    {icon}
    {label}
  </button>
);

ComplaintsTable.propTypes = {
  complaints:      PropTypes.array.isRequired,
  loading:         PropTypes.bool.isRequired,
  error:           PropTypes.string,
  fetchComplaints: PropTypes.func.isRequired,
  onFeedback:      PropTypes.func.isRequired,
};

export default ComplaintsTable;