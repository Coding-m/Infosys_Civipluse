import React, { useEffect, useState, useMemo } from "react";
import { Star, MessageSquare, TrendingUp } from "lucide-react";
import api from "../../../api/axios";
import { toast } from "react-toastify";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get("/api/admin/feedback/all")
      .then(res => {
        setFeedbacks(Array.isArray(res.data) ? res.data : []); // ✅ Safe array check
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message ||
          "Failed to load feedbacks. Please try again later."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ Memoized stats — don't recalculate on every render
  const stats = useMemo(() => {
    if (!feedbacks.length) return { avgRating: 0, avgBehaviour: 0 };
    return {
      avgRating: (
        feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length
      ).toFixed(1),
      avgBehaviour: (
        feedbacks.reduce((sum, f) => sum + (f.officerBehaviourRating || 0), 0) / feedbacks.length
      ).toFixed(1),
    };
  }, [feedbacks]);

  const getTimeliness = (timeliness) => {
    // ✅ Extracted to function — cleaner than inline ternaries
    switch (timeliness) {
      case "ON_TIME":      return "⏱ On Time";
      case "SLIGHT_DELAY": return "⏳ Slight Delay";
      case "VERY_LATE":    return "🐢 Very Late";
      default:             return timeliness || "N/A";
    }
  };

  if (loading) {
    return (
      <div style={{ background: "var(--surface)", borderRadius: "24px", padding: "3rem", textAlign: "center", border: "1px solid var(--border-soft)" }}>
        <span className="spinner" />
        <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>Loading feedbacks...</p>
      </div>
    );
  }

  if (!feedbacks.length) {
    return (
      <div style={{ background: "var(--surface)", borderRadius: "24px", padding: "4rem 2rem", border: "1px solid var(--border-soft)", boxShadow: "var(--card-shadow)", textAlign: "center" }}>
        <MessageSquare size={48} color="var(--text-muted)" strokeWidth={1.5} />
        <h2 style={{ margin: "1rem 0 0.5rem", fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)" }}>
          No Feedback Yet
        </h2>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Citizens haven't submitted any feedback yet
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--surface)", borderRadius: "24px", padding: "2.5rem", border: "1px solid var(--border-soft)", boxShadow: "var(--card-shadow)" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.75rem", fontWeight: "700", color: "var(--text-primary)" }}>
          All Citizen Feedback
        </h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem" }}>
          System-wide feedback metrics and citizen reviews
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard
          label="Total Feedbacks"
          value={feedbacks.length}
          color="var(--accent)"
        />
        <StatCard
          label="Average Rating"
          value={`${stats.avgRating} ★`}
          color="white"
          gradient="linear-gradient(135deg, var(--primary), var(--primary-strong))"
        />
        <StatCard
          label="Avg Behaviour"
          value={stats.avgBehaviour}
          color="white"
          gradient="linear-gradient(135deg, #666, #888)"
          icon={<TrendingUp size={24} color="white" />}
        />
      </div>

      <div style={{ height: "1px", background: "var(--border-soft)", marginBottom: "2rem" }} />

      {/* Feedbacks Grid */}
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {feedbacks.map((f) => (
          // ✅ Use complaintId as key — not array index
          <div
            key={f.complaintId}
            style={{
              background: "color-mix(in srgb, var(--primary) 2%, transparent)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "1.5rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Complaint Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-soft)" }}>
              <div>
                <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.05rem", fontWeight: "600", color: "var(--text-primary)" }}>
                  Complaint #{f.complaintId}
                </h3>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  {f.complaintTitle}
                </p>
              </div>
              {f.complaintCategory && (
                <span style={{ display: "inline-block", background: "var(--accent-light)", color: "var(--accent)", padding: "0.4rem 0.9rem", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "600", alignSelf: "flex-start" }}>
                  {f.complaintCategory}
                </span>
              )}
            </div>

            {/* Citizen Info */}
            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ margin: "0 0 0.25rem", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Citizen</p>
              <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600", color: "var(--text-primary)" }}>{f.citizenName}</p>
              {f.citizenLocation && (
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>📍 {f.citizenLocation}</p>
              )}
            </div>

            {/* Ratings */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <RatingCard label="Overall Rating" value={f.rating || 0} color="var(--accent)" />
              <RatingCard label="Behaviour" value={f.officerBehaviourRating || 0} color="var(--primary)" />
              <div style={{ background: "color-mix(in srgb, var(--text-muted) 8%, transparent)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
                <p style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Timeliness</p>
                <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600", color: "var(--text-primary)", padding: "0.75rem 0" }}>
                  {getTimeliness(f.timeliness)}
                </p>
              </div>
            </div>

            {/* Comment */}
            {f.feedbackComment && (
              <div style={{ background: "color-mix(in srgb, var(--text-primary) 3%, transparent)", borderRadius: "12px", padding: "1rem", borderLeft: "3px solid var(--primary)" }}>
                <p style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Comment</p>
                <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.6 }}>
                  "{f.feedbackComment}"
                </p>
              </div>
            )}

            {/* Submitted At */}
            {f.submittedAt && (
              <p style={{ margin: "1rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Submitted on {new Date(f.submittedAt).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ✅ Extracted reusable components
const StatCard = ({ label, value, color, gradient, icon }) => (
  <div style={{ background: gradient || "color-mix(in srgb, var(--accent) 8%, transparent)", borderRadius: "16px", padding: "1.25rem", textAlign: "center" }}>
    <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", fontWeight: "600", color: gradient ? "rgba(255,255,255,0.8)" : "var(--text-muted)", textTransform: "uppercase" }}>{label}</p>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
      <p style={{ margin: 0, fontSize: "2rem", fontWeight: "700", color }}>{value}</p>
      {icon}
    </div>
  </div>
);

const RatingCard = ({ label, value, color }) => (
  <div style={{ background: `color-mix(in srgb, ${color} 8%, transparent)`, borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
    <p style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>{label}</p>
    <div style={{ display: "flex", justifyContent: "center", gap: "0.25rem", marginBottom: "0.5rem" }}>
      {[...Array(5)].map((_, j) => (
        <Star key={j} size={18} fill={j < value ? color : "transparent"} color={j < value ? color : "var(--border)"} />
      ))}
    </div>
    <p style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color }}>{value}/5</p>
  </div>
);

export default AdminFeedback;