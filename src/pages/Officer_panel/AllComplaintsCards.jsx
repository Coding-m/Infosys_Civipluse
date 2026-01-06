import React, { useState } from "react";
import {
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  Maximize2,
  Calendar,
  ChevronRight
} from "lucide-react";
import { statusColor, priorityColor } from "./helpers";

/* STATUS → PROGRESS MAPPING */
const getProgressByStatus = (status) => {
  switch (status) {
    case "PENDING":
      return 0;
    case "ASSIGNED":
      return 10;
    case "IN_PROGRESS":
      return 50;
    case "ESCALATED":
      return 75;
    case "RESOLVED":
      return 100;
    default:
      return 0;
  }
};

const AllComplaintsCards = ({ complaints, onViewDetails }) => {
  const [previewImage, setPreviewImage] = useState(null);

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING": return <Clock size={16} />;
      case "IN_PROGRESS": return <Clock size={16} />;
      case "RESOLVED": return <CheckCircle2 size={16} />;
      case "ESCALATED": return <AlertCircle size={16} />;
      default: return null;
    }
  };

  if (!complaints || complaints.length === 0) {
    return (
      <div style={{
        background: "var(--surface)",
        borderRadius: "24px",
        padding: "5rem 2rem",
        border: "1px solid var(--border-soft)",
        boxShadow: "var(--card-shadow)",
        textAlign: "center",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}>
          <FileText size={56} color="var(--text-muted)" strokeWidth={1.2} style={{ opacity: 0.5 }} />
        </div>
        <h2 style={{
          margin: "0 0 0.75rem",
          fontSize: "1.5rem",
          fontWeight: "800",
          color: "var(--text-primary)",
        }}>
          No Grievances Assigned
        </h2>
        <p style={{
          margin: 0,
          color: "var(--text-muted)",
          fontSize: "1.05rem",
          fontWeight: "500",
          maxWidth: "400px",
          margin: "0 auto"
        }}>
          You don't have any complaints assigned to your department at the moment.
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
        gap: "2rem"
      }}>

        {complaints.map((c) => {
          const isResolved = c.status === "RESOLVED";
          const progress = getProgressByStatus(c.status);

          return (
            <div
              key={c.id}
              style={{
                background: "var(--surface)",
                borderRadius: "32px",
                border: "1px solid var(--border-soft)",
                boxShadow: "var(--card-shadow)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.borderColor = "var(--primary-light)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--border-soft)";
              }}
            >
              {/* Image & Ribbon */}
              <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
                <img
                  src={c.imageUrl ? `http://localhost:8081${c.imageUrl}` : "https://via.placeholder.com/400x200"}
                  alt={c.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
                  onClick={() => c.imageUrl && setPreviewImage(`http://localhost:8081${c.imageUrl}`)}
                />

                {c.priority === "HIGH" && (
                  <div style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    background: "#ef4444",
                    color: "#fff",
                    padding: "6px 14px",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: "800",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <AlertCircle size={14} /> HIGH PRIORITY
                  </div>
                )}

                <div style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "16px",
                  background: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(4px)",
                  padding: "6px 12px",
                  borderRadius: "10px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--primary)"
                }}>
                  {c.category}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "1.75rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: "800",
                    background: `color-mix(in srgb, ${isResolved ? "#10b981" : "#f59e0b"} 10%, transparent)`,
                    color: isResolved ? "#10b981" : "#f59e0b"
                  }}>
                    {getStatusIcon(c.status)}
                    {c.status}
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-muted)" }}>#{c.id}</span>
                </div>

                <h3 style={{
                  fontSize: "1.25rem",
                  fontWeight: "800",
                  color: "var(--text-primary)",
                  marginBottom: "0.75rem",
                  lineHeight: 1.3
                }}>
                  {c.title}
                </h3>

                <p style={{
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <Calendar size={14} />
                  {isResolved ? `Resolved: ${new Date(c.resolutionDate).toLocaleDateString()}` : "Resolution Pending"}
                </p>

                {/* Progress */}
                <div style={{ marginBottom: "2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-primary)" }}>Grievance Progress</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: "800", color: progress === 100 ? "#10b981" : "var(--primary)" }}>{progress}%</span>
                  </div>
                  <div style={{ height: "10px", borderRadius: "5px", background: "rgba(0,0,0,0.05)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${progress}%`,
                      background: isResolved ? "#10b981" : "linear-gradient(90deg, var(--primary), var(--primary-light))",
                      borderRadius: "5px",
                      transition: "width 1s ease-out"
                    }} />
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => !isResolved && onViewDetails(c)}
                  disabled={isResolved}
                  style={{
                    marginTop: "auto",
                    width: "100%",
                    padding: "1rem",
                    borderRadius: "16px",
                    border: "none",
                    background: isResolved ? "rgba(0,0,0,0.05)" : "linear-gradient(135deg, var(--primary), var(--primary-strong))",
                    color: isResolved ? "var(--text-muted)" : "#fff",
                    fontWeight: "700",
                    fontSize: "0.95rem",
                    cursor: isResolved ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={e => {
                    if (!isResolved) {
                      e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isResolved) {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }
                  }}
                >
                  {isResolved ? "Complaint Resolved" : "Manage Grievance"}
                  {!isResolved && <ChevronRight size={18} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {previewImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            cursor: "zoom-out"
          }}
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}
          />
        </div>
      )}
    </>
  );
};

export default AllComplaintsCards;
