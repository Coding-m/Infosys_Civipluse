import React, { useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import {
  MessageSquare,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const FeedbackList = ({
  complaints,
  onSelectComplaint,
}) => {
  const resolvedComplaints = useMemo(() => {
    return complaints.filter(
      (complaint) => complaint.status === "RESOLVED"
    );
  }, [complaints]);

  const handleSelect = useCallback(
    (complaint) => {
      onSelectComplaint(complaint);
    },
    [onSelectComplaint]
  );

  if (resolvedComplaints.length === 0) {
    return (
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "24px",
          padding: "4rem 2rem",
          border: "1px solid var(--border-soft)",
          boxShadow: "var(--card-shadow)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "1.5rem",
          }}
        >
          <MessageSquare
            size={48}
            color="var(--text-muted)"
            strokeWidth={1.5}
          />
        </div>

        <h2
          style={{
            margin: "0 0 0.5rem",
            fontSize: "1.3rem",
            fontWeight: "700",
            color: "var(--text-primary)",
          }}
        >
          No Resolved Complaints Yet
        </h2>

        <p
          style={{
            margin: 0,
            color: "var(--text-muted)",
            fontSize: "0.95rem",
            lineHeight: 1.6,
          }}
        >
          Once your complaints are resolved,
          you will be able to share your feedback here.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "24px",
        padding: "2.5rem",
        border: "1px solid var(--border-soft)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            margin: "0 0 0.5rem",
            fontSize: "1.8rem",
            fontWeight: "700",
            color: "var(--text-primary)",
          }}
        >
          Share Your Feedback
        </h1>

        <p
          style={{
            margin: 0,
            color: "var(--text-muted)",
            fontSize: "0.95rem",
            lineHeight: 1.6,
          }}
        >
          Help us improve by rating your experience
          with resolved complaints.
        </p>
      </div>

      {/* Divider */}
      <div
        style={{
          height: "1px",
          background: "var(--border-soft)",
          marginBottom: "2rem",
        }}
      />

      {/* Complaint List */}
      <div
        style={{
          display: "grid",
          gap: "1rem",
        }}
      >
        {resolvedComplaints.map((complaint) => (
          <button
            key={complaint.id}
            type="button"
            onClick={() => handleSelect(complaint)}
            style={{
              background:
                "color-mix(in srgb, var(--primary) 3%, transparent)",
              border: "1px solid var(--border)",
              borderRadius: "18px",
              padding: "1.4rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "inherit",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "color-mix(in srgb, var(--primary) 6%, transparent)";
              e.currentTarget.style.borderColor =
                "var(--primary)";
              e.currentTarget.style.transform =
                "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "color-mix(in srgb, var(--primary) 3%, transparent)";
              e.currentTarget.style.borderColor =
                "var(--border)";
              e.currentTarget.style.transform =
                "translateX(0)";
            }}
          >
            {/* Left Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                flex: 1,
                textAlign: "left",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  background:
                    "linear-gradient(135deg, var(--primary), var(--primary-strong))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CheckCircle2
                  size={22}
                  color="#ffffff"
                />
              </div>

              {/* Content */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                  }}
                >
                  {complaint.title}
                </h3>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      background: "var(--accent-light)",
                      color: "var(--accent)",
                      padding: "0.3rem 0.75rem",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                    }}
                  >
                    {complaint.category}
                  </span>

                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    Complaint ID: {complaint.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--primary)",
                fontWeight: "600",
                marginLeft: "1rem",
                whiteSpace: "nowrap",
              }}
            >
              Give Feedback
              <ArrowRight size={18} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

FeedbackList.propTypes = {
  complaints: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]).isRequired,

      title: PropTypes.string.isRequired,

      category: PropTypes.string,

      status: PropTypes.string.isRequired,
    })
  ).isRequired,

  onSelectComplaint: PropTypes.func.isRequired,
};

export default React.memo(FeedbackList);