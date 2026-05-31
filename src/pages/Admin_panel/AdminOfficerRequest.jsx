import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { CheckCircle2, X, Loader, Eye } from "lucide-react";
import { toast } from "react-toastify";

const AdminOfficerRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);

  // ── Fetch requests ────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/admin/officer-update-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(res.data);
      } catch {
        toast.error("Failed to fetch officer update requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this request?")) return;
    const token = localStorage.getItem("token");
    try {
      await api.put(
        `/api/admin/officer-update-requests/${id}/approve`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Request approved");
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "APPROVED" } : r));
    } catch {
      toast.error("Failed to approve request");
    }
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const handleReject = async (id) => {
    const reason = prompt("Enter reason for rejection:");
    if (!reason) return;
    const token = localStorage.getItem("token");
    try {
      await api.put(
        `/api/admin/officer-update-requests/${id}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Request rejected");
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "REJECTED", rejectionReason: reason } : r));
    } catch {
      toast.error("Failed to reject request");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <Loader className="animate-spin" size={48} />
    </div>
  );

  if (requests.length === 0) return (
    <div className="p-6 text-center text-gray-500">
      No pending officer update requests
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Officer Profile Update Requests</h1>
      {requests.map((req) => (
        <div key={req.id} className="border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-lg">{req.officer.name}</h2>
              <p className="text-sm text-gray-500">
                Requested At: {new Date(req.requestedAt).toLocaleString()}
              </p>
            </div>
            <span className={`px-2 py-1 rounded text-white text-sm ${
              req.status === "PENDING"  ? "bg-yellow-500" :
              req.status === "APPROVED" ? "bg-green-500"  : "bg-red-500"
            }`}>
              {req.status}
            </span>
          </div>

          <div className="mt-2">
            <details className="bg-gray-50 p-2 rounded">
              <summary className="cursor-pointer font-medium flex items-center gap-1">
                <Eye size={16} /> View Requested Changes
              </summary>
              <pre className="whitespace-pre-wrap text-sm mt-2 bg-white p-2 rounded border overflow-auto max-h-60">
                {JSON.stringify(JSON.parse(req.requestedData), null, 2)}
              </pre>
            </details>
          </div>

          {req.status === "PENDING" && (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => handleApprove(req.id)}
                className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 flex items-center gap-1"
              >
                <CheckCircle2 size={16} /> Approve
              </button>
              <button
                type="button"
                onClick={() => handleReject(req.id)}
                className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 flex items-center gap-1"
              >
                <X size={16} /> Reject
              </button>
            </div>
          )}

          {req.status === "REJECTED" && req.rejectionReason && (
            <p className="mt-2 text-red-600 font-medium">
              Rejection Reason: {req.rejectionReason}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminOfficerRequest;