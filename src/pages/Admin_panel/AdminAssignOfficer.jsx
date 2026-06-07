import {
  Dialog, DialogTitle, DialogContent,
  DialogActions, Select, MenuItem,
  Button, CircularProgress, Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios"; // ✅ Use configured axios instance

export default function AssignOfficerModal({ complaint, onClose, refresh }) {
  const [officers, setOfficers]   = useState([]);
  const [officerId, setOfficerId] = useState("");
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);

  // ── Fetch Available Officers ───────────────────────────────────────────────
  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        setFetching(true);
        // ✅ Use workload endpoint — already exists and returns officers with status
        const res = await api.get("/api/admin/complaints/officers/workload");
        // ✅ Filter to only show AVAILABLE officers matching complaint category
        const available = Array.isArray(res.data)
          ? res.data.filter((o) =>
              o.status === "AVAILABLE" &&
              (!complaint?.category || o.department === complaint.category)
            )
          : [];
        setOfficers(available);
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
          "Failed to load officers"
        );
      } finally {
        setFetching(false);
      }
    };

    fetchOfficers();
  }, [complaint?.category]);

  // ── Assign Officer ────────────────────────────────────────────────────────
  const handleAssign = async () => {
    if (!officerId) return;

    setLoading(true);
    try {
      await api.post(
        `/api/admin/complaints/${complaint.id}/assign-officer`,
        { officerId }
      );
      toast.success("Officer assigned successfully");
      refresh?.();
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to assign officer. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Assign Officer
        {complaint?.title && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Complaint: {complaint.title}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {fetching ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
            <CircularProgress size={40} />
          </div>
        ) : officers.length === 0 ? (
          // ✅ Show message if no available officers
          <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
            No available officers for this department
          </Typography>
        ) : (
          <Select
            fullWidth
            value={officerId}
            onChange={(e) => setOfficerId(e.target.value)}
            displayEmpty
            sx={{ mt: 1, borderRadius: "10px" }}
          >
            <MenuItem value="" disabled>
              Select an officer...
            </MenuItem>
            {officers.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {o.name} — {o.department}
                {/* ✅ Show workload to help admin decide */}
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  ({o.activeComplaints} active)
                </Typography>
              </MenuItem>
            ))}
          </Select>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          disabled={!officerId || loading || fetching}
          onClick={handleAssign}
          sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, background: "linear-gradient(135deg, var(--primary), var(--primary-strong))" }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Assign Officer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}