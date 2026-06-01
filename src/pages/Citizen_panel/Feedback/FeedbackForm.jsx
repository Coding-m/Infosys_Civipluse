import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Star, Send } from "lucide-react";
import { toast } from "react-toastify"; // ✅ Replace alert() with toast
import api from "../../../api/axios";

const INITIAL_FORM = {
  rating: 0,
  officerBehaviourRating: 0,
  resolutionStatus: "",
  timeliness: "",
  feedbackComment: "",
  reopened: false, // ✅ Backend requires this field
};

const FeedbackForm = ({ complaint, onBack }) => {
  const [form, setForm]       = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  const updateForm = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validate = () => {
    if (form.rating === 0) {
      toast.warn("Please provide an overall rating");
      return false;
    }
    if (form.officerBehaviourRating === 0) {
      toast.warn("Please provide an officer behaviour rating");
      return false;
    }
    if (!form.resolutionStatus) {
      toast.warn("Please select a resolution status");
      return false;
    }
    if (!form.timeliness) {
      toast.warn("Please select timeliness");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post(
        `/api/citizen/feedback/submit/${complaint.id}`,
        form
      );
      toast.success("Feedback submitted successfully!");
      onBack();

    } catch (error) {
      // ✅ Show backend error message — e.g. "Feedback already submitted"
      toast.error(
        error?.response?.data?.message ||
        "Failed to submit feedback. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value, onChange) => (
    <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", marginBottom: "1rem" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          disabled={loading}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`} // ✅ Accessibility
          style={{
            background: "transparent",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s ease",
            opacity: loading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <Star
            size={32}
            fill={star <= value ? "var(--accent)" : "transparent"}
            color={star <= value ? "var(--accent)" : "var(--border)"}
          />
        </button>
      ))}
    </div>
  );

  const selectStyle = {
    width: "100%",
    padding: "0.9rem",
    borderRadius: "12px",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text-primary)",
    fontSize: "1rem",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      background: "var(--surface)",
      borderRadius: "24px",
      padding: "2.5rem",
      border: "1px solid var(--border-soft)",
      boxShadow: "var(--card-shadow)",
      maxWidth: "700px",
      margin: "0 auto",
    }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.8rem", fontWeight: "700", color: "var(--text-primary)" }}>
          Share Your Feedback
        </h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Help us improve — feedback for complaint #{complaint.id}
        </p>
      </div>

      <div style={{ height: "1px", background: "var(--border-soft)", marginBottom: "2rem" }} />

      <div style={{ display: "grid", gap: "1.75rem" }}>

        {/* Overall Rating */}
        <div>
          <label style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            Overall Experience Rating *
          </label>
          {renderStars(form.rating, (v) => updateForm("rating", v))}
        </div>

        {/* Officer Behaviour Rating */}
        <div>
          <label style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            Officer Behaviour Rating *
          </label>
          {renderStars(form.officerBehaviourRating, (v) => updateForm("officerBehaviourRating", v))}
        </div>

        {/* Resolution Status */}
        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-primary)" }}>
            Resolution Status *
          </label>
          <select
            value={form.resolutionStatus}
            disabled={loading}
            onChange={(e) => updateForm("resolutionStatus", e.target.value)}
            style={selectStyle}
          >
            <option value="">Select status...</option>
            <option value="RESOLVED">Fully Resolved</option>
            <option value="PARTIALLY_RESOLVED">Partially Resolved</option>
            <option value="NOT_RESOLVED">Not Resolved</option>
          </select>
        </div>

        {/* Timeliness */}
        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-primary)" }}>
            Resolution Timeliness *
          </label>
          <select
            value={form.timeliness}
            disabled={loading}
            onChange={(e) => updateForm("timeliness", e.target.value)}
            style={selectStyle}
          >
            <option value="">Select timeliness...</option>
            <option value="ON_TIME">On Time</option>
            <option value="SLIGHT_DELAY">Slight Delay</option>
            <option value="VERY_LATE">Very Late</option>
          </select>
        </div>

        {/* Reopen Complaint */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <input
            id="reopened"
            type="checkbox"
            checked={form.reopened}
            disabled={loading}
            onChange={(e) => updateForm("reopened", e.target.checked)}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />
          <label htmlFor="reopened" style={{ fontWeight: 600, color: "var(--text-primary)", cursor: "pointer" }}>
            Request to reopen this complaint
          </label>
        </div>

        {/* Comments */}
        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-primary)" }}>
            Additional Comments (Optional)
          </label>
          <textarea
            rows={5}
            value={form.feedbackComment}
            disabled={loading}
            onChange={(e) => updateForm("feedbackComment", e.target.value)}
            placeholder="Write your feedback here..."
            maxLength={500} // ✅ Prevent excessive input
            style={{
              ...selectStyle,
              resize: "vertical",
              minHeight: "120px",
            }}
          />
          {/* ✅ Character count */}
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "right" }}>
            {form.feedbackComment.length}/500
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          style={{
            padding: "1rem",
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            opacity: loading ? 0.7 : 1,
            fontFamily: "inherit",
          }}
        >
          {loading ? (
            <><span className="spinner" /> Submitting...</>
          ) : (
            <><Send size={18} /> Submit Feedback</>
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          style={{
            padding: "1rem",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 500,
            color: "var(--text-primary)",
            fontSize: "1rem",
            fontFamily: "inherit",
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
};

FeedbackForm.propTypes = {
  complaint: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
};

export default React.memo(FeedbackForm);