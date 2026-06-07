import React, { useEffect, useState, useCallback } from "react";
import { CheckCircle2, X, Eye, Bell } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../api/axios"; // ✅ Already using api — just remove manual headers

const AdminOfficerRequest = () => {
  const [requests, setRequests]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [rejectModal, setRejectModal]   = useState(null); // ✅ id of request being rejected
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing]     = useState(null); // ✅ id of request being processed

  // ── Fetch Requests ────────────────────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      // ✅ Removed manual headers — api instance handles token
      const res = await api.get("/api/admin/officer-update-requests");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      if (error?.response?.status !== 401) {
        toast.error(
          error?.response?.data?.message ||
          "Failed to fetch officer update requests"
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      // ✅ Removed manual headers
      await api.put(`/api/admin/officer-update-requests/${id}/approve`);
      toast.success("Request approved successfully");
      setRequests((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: "APPROVED" } : r)
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to approve request"
      );
    } finally {
      setProcessing(null);
    }
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      toast.warn("Please enter a rejection reason");
      return;
    }

    setProcessing(rejectModal);
    try {
      // ✅ Removed manual headers — replaced prompt() with modal
      await api.put(
        `/api/admin/officer-update-requests/${rejectModal}/reject`,
        { reason: rejectReason.trim() }
      );
      toast.success("Request rejected");
      setRequests((prev) =>
        prev.map((r) =>
          r.id === rejectModal
            ? { ...r, status: "REJECTED", rejectionReason: rejectReason.trim() }
            : r
        )
      );
      setRejectModal(null);
      setRejectReason("");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to reject request"
      );
    } finally {
      setProcessing(null);
    }
  };

  // ✅ Safely parse requested data
  const parseRequestedData = (data) => {
    try {
      return JSON.stringify(JSON.parse(data), null, 2);
    } catch {
      return data || "No data";
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "4rem", color: "var(--text-muted)" }}>
        <span className="spinner" style={{ width: "40px", height: "40px" }} />
      </div>
    );
  }

  // ── Empty State ───────────────────────────────────────────────────────────
  if (requests.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--surface)", borderRadius: "24px", border: "1px solid var(--border-soft)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "60px", height: "60px", borderRadius: "50%", background: "color-mix(in srgb, var(--primary) 10%, transparent)", marginBottom: "1.5rem" }}>
          <Bell size={32} color="var(--primary)" />
        </div>
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)" }}>
          No Pending Requests
        </h2>
        <p style={{ margin: 0, color: "var(--text-muted)" }}>
          Officer profile update requests will appear here
        </p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ margin: "0 0 1.5rem", fontSize: "1.75rem", fontWeight: "700", color: "var(--text-primary)" }}>
        Officer Profile Update Requests
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {requests.map((req) => (
          <div
            key={req.id}
            style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: "16px", padding: "1.5rem", boxShadow: "var(--card-shadow)" }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ margin: "0 0 0.25rem", fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  {req.officer?.name || "Unknown Officer"}
                </h2>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {req.officer?.email} •{" "}
                  {req.requestedAt
                    ? new Date(req.requestedAt).toLocaleString()
                    : "Unknown time"}
                </p>
              </div>

              {/* Status Badge */}
              <span style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "999px",
                fontSize: "0.8rem",
                fontWeight: "700",
                color: "white",
                background:
                  req.status === "PENDING"  ? "#f59e0b" :
                  req.status === "APPROVED" ? "#10b981" : "#ef4444",
              }}>
                {req.status}
              </span>
            </div>

            {/* Requested Changes */}
            <div style={{ marginTop: "1rem" }}>
              <details style={{ background: "color-mix(in srgb, var(--primary) 3%, transparent)", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid var(--border-soft)" }}>
                <summary style={{ cursor: "pointer", fontWeight: "600", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                  <Eye size={16} /> View Requested Changes
                </summary>
                <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem", marginTop: "0.75rem", background: "var(--surface)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", overflowX: "auto", maxHeight: "200px", color: "var(--text-primary)" }}>
                  {parseRequestedData(req.requestedData)}
                </pre>
              </details>
            </div>

            {/* Action Buttons */}
            {req.status === "PENDING" && (
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => handleApprove(req.id)}
                  disabled={processing === req.id}
                  style={{ padding: "0.6rem 1.25rem", background: "#10b981", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", cursor: processing === req.id ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", fontFamily: "inherit", opacity: processing === req.id ? 0.7 : 1 }}
                >
                  <CheckCircle2 size={16} />
                  {processing === req.id ? "Approving..." : "Approve"}
                </button>
                <button
                  type="button"
                  onClick={() => { setRejectModal(req.id); setRejectReason(""); }}
                  disabled={processing === req.id}
                  style={{ padding: "0.6rem 1.25rem", background: "#ef4444", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", cursor: processing === req.id ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", fontFamily: "inherit", opacity: processing === req.id ? 0.7 : 1 }}
                >
                  <X size={16} /> Reject
                </button>
              </div>
            )}

            {/* Rejection Reason */}
            {req.status === "REJECTED" && req.rejectionReason && (
              <p style={{ marginTop: "0.75rem", color: "#ef4444", fontWeight: "600", fontSize: "0.9rem" }}>
                Rejection Reason: {req.rejectionReason}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ✅ Reject Modal — replaces prompt() */}
      {rejectModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "2rem" }}
          onClick={(e) => { if (e.target === e.currentTarget) setRejectModal(null); }}
        >
          <div style={{ background: "var(--surface)", borderRadius: "20px", padding: "2rem", maxWidth: "500px", width: "100%", border: "1px solid var(--border-soft)", boxShadow: "0 50px 100px rgba(0,0,0,0.3)" }}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1.25rem", fontWeight: "700", color: "var(--text-primary)" }}>
              Reject Request
            </h2>
            <p style={{ margin: "0 0 1rem", color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Please provide a reason for rejection:
            </p>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              maxLength={300}
              style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: "1rem", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
            />
            <p style={{ margin: "0.25rem 0 1rem", fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "right" }}>
              {rejectReason.length}/300
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                style={{ flex: 1, padding: "0.85rem", background: "transparent", border: "1px solid var(--border)", borderRadius: "12px", fontWeight: "600", cursor: "pointer", color: "var(--text-primary)", fontFamily: "inherit" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={processing === rejectModal}
                style={{ flex: 1, padding: "0.85rem", background: "#ef4444", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: processing === rejectModal ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: processing === rejectModal ? 0.7 : 1 }}
              >
                {processing === rejectModal ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOfficerRequest;