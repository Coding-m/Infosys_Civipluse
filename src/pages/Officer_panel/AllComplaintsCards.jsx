import React, { useState } from "react";
import PropTypes from "prop-types";
import { FileText, Calendar, ChevronRight, Maximize2, X } from "lucide-react";

const getProgressByStatus = (status) => {
  switch (status) {
    case "PENDING":     return 0;
    case "ASSIGNED":    return 10;
    case "IN_PROGRESS": return 50;
    case "ESCALATED":   return 75;
    case "RESOLVED":    return 100;
    default:            return 0;
  }
};

// ✅ Only accept Cloudinary URLs — no BACKEND_URL prefix needed
const getImageUrl = (c) => {
  if (c.officerEvidenceUrl?.startsWith("https://"))
    return { url: c.officerEvidenceUrl, label: "Officer Evidence" };
  if (c.imageUrl?.startsWith("https://"))
    return { url: c.imageUrl, label: "Citizen Photo" };
  return null;
};

const AllComplaintsCards = ({ complaints, onViewDetails }) => {
  const [previewImage, setPreviewImage] = useState(null);

  if (!complaints?.length) {
    return (
      <div style={{ background: "var(--surface)", borderRadius: "24px", padding: "5rem 2rem", border: "1px solid var(--border-soft)", boxShadow: "var(--card-shadow)", textAlign: "center", color: "var(--text-muted)" }}>
        <FileText size={56} style={{ opacity: 0.4, marginBottom: "1rem" }} />
        <h2 style={{ margin: "0 0 0.5rem", color: "var(--text-primary)" }}>No Grievances Assigned</h2>
        <p style={{ margin: 0, fontSize: "0.95rem" }}>Complaints assigned to you will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "2rem" }}>
        {complaints.map((c) => {
          const isResolved = c.status === "RESOLVED";
          const progress   = getProgressByStatus(c.status);
          const image      = getImageUrl(c); // ✅ Cloudinary URL helper

          return (
            <div
              key={c.id}
              style={{ background: "var(--surface)", borderRadius: "32px", border: "1px solid var(--border-soft)", boxShadow: "var(--card-shadow)", overflow: "hidden", display: "flex", flexDirection: "column" }}
            >
              {/* Image */}
              <div style={{ height: "220px", overflow: "hidden", position: "relative", background: "color-mix(in srgb, var(--border) 30%, transparent)" }}>
                {image ? (
                  <>
                    <img
                      src={image.url}
                      alt={c.title || "Complaint image"}
                      style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in" }}
                      onClick={() => setPreviewImage(image.url)}
                      onError={(e) => { e.target.style.display = "none"; }} // ✅ Hide broken images
                    />
                    <span style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(0,0,0,0.6)", color: "#fff", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "600" }}>
                      {image.label}
                    </span>
                    <div
                      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s", cursor: "zoom-in" }}
                      onClick={() => setPreviewImage(image.url)}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.2)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0)"; }}
                    >
                      <Maximize2 size={24} color="#fff" style={{ opacity: 0, transition: "opacity 0.2s" }} />
                    </div>
                  </>
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", gap: "0.5rem" }}>
                    <FileText size={32} style={{ opacity: 0.4 }} />
                    <span style={{ fontSize: "0.85rem" }}>No Image</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: "1.5rem 1.75rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  {c.title}
                </h3>

                {/* Category + ID */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {c.category && (
                    <span style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", background: "color-mix(in srgb, var(--primary) 10%, transparent)", color: "var(--primary)", fontSize: "0.8rem", fontWeight: "600" }}>
                      {c.category}
                    </span>
                  )}
                  <span style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", background: "color-mix(in srgb, var(--border) 30%, transparent)", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    #{c.id}
                  </span>
                </div>

                {/* Date */}
                <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <Calendar size={14} />
                  {isResolved && c.resolutionDate
                    ? `Resolved: ${new Date(c.resolutionDate).toLocaleDateString()}`
                    : c.expectedCompletionDate
                    ? `Expected: ${new Date(c.expectedCompletionDate).toLocaleDateString()}`
                    : "Resolution Pending"}
                </p>

                {/* Progress Bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Progress</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>{progress}%</span>
                  </div>
                  <div style={{ height: "8px", background: "var(--border-soft)", borderRadius: "999px" }}>
                    <div style={{ width: `${progress}%`, height: "100%", borderRadius: "999px", background: isResolved ? "#10b981" : "linear-gradient(90deg, var(--primary), var(--primary-strong))", transition: "width 0.3s ease" }} />
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={() => !isResolved && onViewDetails(c)}
                  disabled={isResolved}
                  style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "12px", background: isResolved ? "var(--border-soft)" : "linear-gradient(135deg, var(--primary), var(--primary-strong))", color: isResolved ? "var(--text-muted)" : "white", border: "none", cursor: isResolved ? "not-allowed" : "pointer", fontWeight: "700", fontSize: "0.95rem", fontFamily: "inherit", transition: "all 0.2s ease" }}
                >
                  {isResolved ? "Complaint Resolved ✓" : "Manage Grievance"}
                  {!isResolved && <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}
          onClick={() => setPreviewImage(null)}
        >
          {/* ✅ Close button */}
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setPreviewImage(null)}
            style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}
          >
            <X size={20} />
          </button>
          <img
            src={previewImage}
            alt="Evidence preview"
            style={{ maxWidth: "90%", maxHeight: "90vh", borderRadius: "16px", objectFit: "contain" }}
            onClick={(e) => e.stopPropagation()} // ✅ Don't close when clicking image
            onError={(e) => { e.target.alt = "Image not available"; }}
          />
        </div>
      )}
    </>
  );
};

AllComplaintsCards.propTypes = {
  complaints:    PropTypes.array.isRequired,
  onViewDetails: PropTypes.func.isRequired,
};

export default AllComplaintsCards;