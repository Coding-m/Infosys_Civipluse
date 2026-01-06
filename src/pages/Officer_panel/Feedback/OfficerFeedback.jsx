import React, { useEffect, useState } from "react";
import { Star, MessageSquare, AlertCircle, Quote } from "lucide-react";
import api from "../../../api/axios";
import { toast } from "react-toastify";

const OfficerFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/officer/feedback/my-complaints")
      .then(res => setFeedbacks(res.data))
      .catch(() => toast.error("Failed to load feedbacks"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{
        background: "var(--surface)",
        borderRadius: "24px",
        padding: "3rem",
        textAlign: "center",
        border: "1px solid var(--border-soft)",
      }}>
        <div style={{
          display: "inline-block",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "3px solid var(--primary)",
          borderTopColor: "transparent",
          animation: "spin 1s linear infinite",
        }} />
        <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>Loading feedbacks...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div style={{
        background: "var(--surface)",
        borderRadius: "24px",
        padding: "4rem 2rem",
        border: "1px solid var(--border-soft)",
        boxShadow: "var(--card-shadow)",
        textAlign: "center",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}>
          <MessageSquare size={48} color="var(--text-muted)" strokeWidth={1.5} />
        </div>
        <h2 style={{
          margin: "0 0 0.5rem",
          fontSize: "1.25rem",
          fontWeight: "600",
          color: "var(--text-primary)",
        }}>
          No Feedback Yet
        </h2>
        <p style={{
          margin: 0,
          color: "var(--text-muted)",
          fontSize: "0.95rem",
        }}>
          Citizens haven't shared feedback on your resolved complaints yet
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: "var(--surface)",
      borderRadius: "24px",
      padding: "2.5rem",
      border: "1px solid var(--border-soft)",
      boxShadow: "var(--card-shadow)",
    }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{
          margin: "0 0 0.75rem",
          fontSize: "2rem",
          fontWeight: "800",
          color: "var(--text-primary)",
          letterSpacing: "-0.5px"
        }}>
          Citizen Feedback
        </h1>
        <p style={{
          margin: 0,
          color: "var(--text-muted)",
          fontSize: "1rem",
          fontWeight: "500",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <Quote size={18} color="var(--primary)" />
          Read how citizens perceive your grievance resolution efforts.
        </p>
      </div>

      <div style={{
        height: "1px",
        background: "var(--border-soft)",
        marginBottom: "2rem",
      }}></div>

      <div style={{ display: "grid", gap: "1.5rem" }}>
        {feedbacks.map((f, i) => (
          <div
            key={i}
            style={{
              background: "color-mix(in srgb, var(--primary) 2%, transparent)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "1.5rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.background = "color-mix(in srgb, var(--primary) 4%, transparent)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "color-mix(in srgb, var(--primary) 2%, transparent)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "1.5rem",
              paddingBottom: "1.25rem",
              borderBottom: "1px solid var(--border-soft)",
            }}>
              <div>
                <h3 style={{
                  margin: "0 0 0.5rem",
                  fontSize: "1.05rem",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                }}>
                  Complaint #{f.complaintId}
                </h3>
                <p style={{
                  margin: 0,
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                }}>
                  {f.complaintTitle}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{
                  margin: "0 0 0.5rem",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}>
                  From
                </p>
                <p style={{
                  margin: 0,
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                }}>
                  {f.citizenName}
                </p>
                <p style={{
                  margin: "0.25rem 0 0",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                }}>
                  📍 {f.citizenLocation}
                </p>
              </div>
            </div>

            {/* Ratings Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}>
              {/* Overall Rating */}
              <div style={{
                background: "color-mix(in srgb, var(--accent) 8%, transparent)",
                borderRadius: "12px",
                padding: "1rem",
                border: "1px solid var(--accent-light)",
                textAlign: "center",
              }}>
                <p style={{
                  margin: "0 0 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}>
                  Overall Rating
                </p>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                  marginBottom: "0.5rem",
                }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < f.rating ? "var(--accent)" : "transparent"}
                      color={i < f.rating ? "var(--accent)" : "var(--border)"}
                    />
                  ))}
                </div>
                <p style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "var(--accent)",
                }}>
                  {f.rating}/5
                </p>
              </div>

              {/* Behaviour Rating */}
              <div style={{
                background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                borderRadius: "12px",
                padding: "1rem",
                border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)",
                textAlign: "center",
              }}>
                <p style={{
                  margin: "0 0 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}>
                  Behaviour Rating
                </p>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                  marginBottom: "0.5rem",
                }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < f.officerBehaviourRating ? "var(--primary)" : "transparent"}
                      color={i < f.officerBehaviourRating ? "var(--primary)" : "var(--border)"}
                    />
                  ))}
                </div>
                <p style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "var(--primary)",
                }}>
                  {f.officerBehaviourRating}/5
                </p>
              </div>

              {/* Timeliness */}
              <div style={{
                background: "color-mix(in srgb, var(--text-muted) 8%, transparent)",
                borderRadius: "12px",
                padding: "1rem",
                border: "1px solid color-mix(in srgb, var(--text-muted) 30%, transparent)",
                textAlign: "center",
              }}>
                <p style={{
                  margin: "0 0 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}>
                  Timeliness
                </p>
                <p style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  padding: "0.5rem 0",
                }}>
                  {f.timeliness === "ON_TIME" && "⏱ On Time"}
                  {f.timeliness === "SLIGHT_DELAY" && "⏳ Slight Delay"}
                  {f.timeliness === "VERY_LATE" && "🐢 Very Late"}
                </p>
              </div>
            </div>

            {/* Comment Section */}
            {f.feedbackComment && (
              <div style={{
                background: "color-mix(in srgb, var(--text-primary) 3%, transparent)",
                borderRadius: "12px",
                padding: "1rem",
                borderLeft: "3px solid var(--primary)",
              }}>
                <p style={{
                  margin: "0 0 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}>
                  Additional Comments
                </p>
                <p style={{
                  margin: 0,
                  fontSize: "0.95rem",
                  color: "var(--text-primary)",
                  lineHeight: 1.6,
                }}>
                  "{f.feedbackComment}"
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OfficerFeedback;
