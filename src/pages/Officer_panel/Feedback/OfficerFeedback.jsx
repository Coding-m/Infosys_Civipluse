import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Star, MessageSquare, Quote } from "lucide-react";
import api from "../../../api/axios";
import { toast } from "react-toastify";

const OfficerFeedback = () => {
  const [complaints, setComplaints]                   = useState([]);
  const [loading, setLoading]                         = useState(true);
  const [expandedComplaintId, setExpandedComplaintId] = useState(null);
  const [feedbackMap, setFeedbackMap]                 = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [complaintsRes, feedbacksRes] = await Promise.all([
          api.get("/api/officer/complaints"),
          api.get("/api/officer/feedbacks"),
        ]);

        setComplaints(Array.isArray(complaintsRes.data) ? complaintsRes.data : []);

        // ✅ Safely build feedback map
        const map = {};
        if (Array.isArray(feedbacksRes.data)) {
          feedbacksRes.data.forEach((f) => {
            if (f?.complaintId) map[f.complaintId] = f;
          });
        }
        setFeedbackMap(map);

      } catch (error) {
        // ✅ Show specific error message from backend
        toast.error(
          error?.response?.data?.message ||
          "Failed to load complaints or feedbacks"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleFeedback = (complaintId) => {
    setExpandedComplaintId(
      expandedComplaintId === complaintId ? null : complaintId
    );
  };

  // ✅ Only show complaints that have feedback — officers only care about feedback
  const complaintsWithFeedback = complaints.filter((c) => feedbackMap[c.id]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
        Loading feedbacks...
      </div>
    );
  }

  if (!complaints.length) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
        <MessageSquare size={48} />
        <p>No complaints found</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2.5rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>
        Citizen Feedback
      </h1>
      <p style={{ color: "var(--text-muted)", display: "flex", gap: 8, alignItems: "center" }}>
        <Quote size={18} />
        {/* ✅ Show counts */}
        {complaintsWithFeedback.length} of {complaints.length} complaints have feedback
      </p>

      {/* ✅ Show message if no feedback yet */}
      {complaintsWithFeedback.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          <MessageSquare size={48} />
          <p>No feedback received yet</p>
        </div>
      )}

      <div style={{ display: "grid", gap: "1.75rem", marginTop: "2rem" }}>
        {complaints.map((c) => {
          const feedback = feedbackMap[c.id];
          const isOpen   = expandedComplaintId === c.id;

          return (
            <div
              key={c.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-soft)",
                borderRadius: "18px",
                padding: "1.75rem",
                boxShadow: "var(--card-shadow)",
                // ✅ Dim complaints without feedback
                opacity: feedback ? 1 : 0.6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-primary)" }}>
                    Complaint #{c.id}
                  </h3>
                  <p style={{ marginTop: 4, color: "var(--text-muted)" }}>
                    🛠 {c.title}
                  </p>
                  {/* ✅ Show status badge */}
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "999px",
                    background: c.status === "RESOLVED"
                      ? "color-mix(in srgb, green 15%, transparent)"
                      : "color-mix(in srgb, var(--text-muted) 12%, transparent)",
                    color: c.status === "RESOLVED" ? "green" : "var(--text-muted)",
                  }}>
                    {c.status}
                  </span>
                </div>

                {/* ✅ Only show button if feedback exists */}
                {feedback ? (
                  <button
                    type="button"
                    onClick={() => handleToggleFeedback(c.id)}
                    style={{
                      background: isOpen ? "#eee" : "var(--primary)",
                      color: isOpen ? "#333" : "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "0.55rem 1.2rem",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {isOpen ? "Hide Feedback" : "View Feedback"}
                  </button>
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    No feedback yet
                  </span>
                )}
              </div>

              {isOpen && feedback && (
                <div style={{
                  marginTop: "1.5rem",
                  padding: "1.5rem",
                  borderRadius: "14px",
                  background: "color-mix(in srgb, var(--primary) 4%, transparent)",
                  border: "1px solid var(--border-soft)",
                }}>
                  <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                    {[
                      { label: "Overall",   value: feedback.rating },
                      { label: "Behaviour", value: feedback.officerBehaviourRating },
                    ].map((r) => (
                      <div key={r.label}>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                          {r.label.toUpperCase()}
                        </p>
                        <div style={{ display: "flex", gap: 4 }}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={18}
                              fill={i < (r.value || 0) ? "var(--primary)" : "transparent"}
                              color={i < (r.value || 0) ? "var(--primary)" : "#ccc"}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "1rem", flexWrap: "wrap" }}>
                    {/* ✅ Safe replace — timeliness might have underscores */}
                    {feedback.timeliness && (
                      <Badge text={feedback.timeliness.replace(/_/g, " ")} />
                    )}
                    {feedback.resolutionStatus && (
                      <Badge text={feedback.resolutionStatus} success />
                    )}
                    <Badge
                      text={feedback.reopened ? "Reopened" : "Not Reopened"}
                      success={!feedback.reopened}
                    />
                  </div>

                  {feedback.feedbackComment && (
                    <div style={{
                      marginTop: "1.25rem",
                      padding: "1rem",
                      borderLeft: "4px solid var(--primary)",
                      background: "color-mix(in srgb, var(--surface) 95%, transparent)",
                      borderRadius: "8px",
                    }}>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0 0 0.5rem" }}>
                        CITIZEN COMMENT
perform                      </p>
                      <p style={{ fontSize: "0.95rem", margin: 0, color: "var(--text-primary)" }}>
                        "{feedback.feedbackComment}"
                      </p>
                    </div>
                  )}

                  {/* ✅ Safe image rendering — Cloudinary URL only */}
                  {feedback.feedbackImageUrl &&
                   feedback.feedbackImageUrl.startsWith("https://") && (
                    <img
                      src={feedback.feedbackImageUrl}
                      alt="Feedback evidence"
                      style={{
                        width: "100%",
                        maxHeight: "200px",
                        objectFit: "cover",
                        marginTop: "1rem",
                        borderRadius: "12px",
                      }}
                      onError={(e) => { e.target.style.display = "none"; }} // ✅ Hide broken images
                    />
                  )}

                  {feedback.submittedAt && (
                    <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      Submitted on {new Date(feedback.submittedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Badge = ({ text, success }) => (
  <span style={{
    padding: "0.35rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 600,
    background: success
      ? "color-mix(in srgb, green 15%, transparent)"
      : "color-mix(in srgb, var(--text-muted) 12%, transparent)",
    color: success ? "green" : "var(--text-muted)",
  }}>
    {text}
  </span>
);

Badge.propTypes = {
  text:    PropTypes.string.isRequired,
  success: PropTypes.bool,
};

export default OfficerFeedback;