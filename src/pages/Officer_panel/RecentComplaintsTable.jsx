import React, { useState } from "react";
import { Maximize2, FileText, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { statusColor, priorityColor } from "./helpers";

const RecentComplaintsTable = ({ complaints }) => {
  const [previewImage, setPreviewImage] = useState(null);

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING": return <Clock size={14} />;
      case "IN_PROGRESS": return <Clock size={14} />;
      case "RESOLVED": return <CheckCircle2 size={14} />;
      case "ESCALATED": return <AlertCircle size={14} />;
      default: return null;
    }
  };

  return (
    <div style={{
      background: "var(--surface)",
      padding: "2rem",
      borderRadius: "24px",
      border: "1px solid var(--border-soft)",
      boxShadow: "var(--card-shadow)",
      overflow: "hidden"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
        <div style={{ padding: "8px", borderRadius: "10px", background: "color-mix(in srgb, var(--primary) 10%, transparent)", color: "var(--primary)" }}>
          <FileText size={20} />
        </div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
          Recent Grievances
        </h2>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
          <thead>
            <tr>
              {["ID", "Complaint Title", "Category", "Status", "Priority", "Evidence", "Target Date"].map((head) => (
                <th key={head} style={{
                  textAlign: "left",
                  padding: "1rem",
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  textTransform: "uppercase"
                }}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  No complaints assigned to you yet.
                </td>
              </tr>
            ) : (
              complaints.map((c) => (
                <tr key={c.id} style={{ transition: "all 0.2s ease" }}>
                  <td style={{ padding: "1rem", color: "var(--text-muted)", fontWeight: "600", borderBottom: "1px solid var(--border-soft)" }}>#{c.id}</td>
                  <td style={{ padding: "1rem", fontWeight: "700", color: "var(--text-primary)", borderBottom: "1px solid var(--border-soft)" }}>{c.title}</td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-soft)" }}>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "8px",
                      background: "rgba(0,0,0,0.03)",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      color: "var(--text-muted)"
                    }}>
                      {c.category}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-soft)" }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      borderRadius: "10px",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      width: "fit-content",
                      background: `color-mix(in srgb, ${c.status === "RESOLVED" ? "#10b981" : c.status === "ESCALATED" ? "#ef4444" : "#f59e0b"} 10%, transparent)`,
                      color: c.status === "RESOLVED" ? "#10b981" : c.status === "ESCALATED" ? "#ef4444" : "#f59e0b"
                    }}>
                      {getStatusIcon(c.status)}
                      {c.status}
                    </div>
                  </td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-soft)" }}>
                    <div style={{
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      fontWeight: "800",
                      width: "fit-content",
                      background: c.priority === "HIGH" ? "rgba(239, 68, 68, 0.1)" : "rgba(0,0,0,0.03)",
                      color: c.priority === "HIGH" ? "#ef4444" : "var(--text-muted)",
                      border: c.priority === "HIGH" ? "1px solid rgba(239,68,68,0.2)" : "1px solid transparent"
                    }}>
                      {c.priority}
                    </div>
                  </td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-soft)" }}>
                    {c.imageUrl ? (
                      <div
                        style={{ position: "relative", width: "45px", height: "45px", cursor: "pointer" }}
                        onClick={() => setPreviewImage(`http://localhost:8081${c.imageUrl}`)}
                      >
                        <img
                          src={`http://localhost:8081${c.imageUrl}`}
                          alt="Evidence"
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
                        />
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0,0,0,0.3)",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 0,
                          transition: "opacity 0.2s ease"
                        }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                          <Maximize2 size={16} color="#fff" />
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No image</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid var(--border-soft)", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {c.resolutionDate ? new Date(c.resolutionDate).toLocaleDateString() : "TBD"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {previewImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
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
            style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "16px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}
          />
        </div>
      )}
    </div>
  );
};

export default RecentComplaintsTable;
