import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box, Grid, Typography, TextField, TableContainer, Table,
  TableHead, TableBody, TableRow, TableCell, Button, Chip,
  MenuItem, CircularProgress, Dialog, DialogContent, IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Users, UserCheck, LifeBuoy, Search, Filter, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../api/axios"; // ✅ Use configured axios instance

const AllComplaints = () => {
  const [complaints, setComplaints]     = useState([]);
  const [officers, setOfficers]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [openPreview, setOpenPreview]   = useState(false);
  const [previewUrl, setPreviewUrl]     = useState("");

  // ── Fetch Data ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ Use api instance — no manual token or API_URL needed
      const [complaintsRes, officersRes] = await Promise.all([
        api.get("/api/admin/complaints"),
        api.get("/api/admin/complaints/officers/workload"),
      ]);
      setComplaints(Array.isArray(complaintsRes.data) ? complaintsRes.data : []);
      setOfficers(Array.isArray(officersRes.data) ? officersRes.data : []);
    } catch (error) {
      if (error?.response?.status !== 401) {
        toast.error("Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => { if (active) await fetchData(); })();
    return () => { active = false; };
  }, [fetchData]);

  // ── Derived Data ──────────────────────────────────────────────────────────
  const departments = useMemo(() =>
    [...new Set(officers.map((o) => o.department).filter(Boolean))],
  [officers]);

  const availableOfficers = useMemo(() =>
    officers
      .filter((o) => o.department === selectedDept && o.status === "AVAILABLE")
      .sort((a, b) => a.activeComplaints - b.activeComplaints),
  [officers, selectedDept]);

  const filteredComplaints = useMemo(() =>
    complaints.filter((c) => {
      const matchesSearch =
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.category?.toLowerCase().includes(search.toLowerCase());
      const matchesDept = selectedDept ? c.category === selectedDept : true;
      return matchesSearch && matchesDept;
    }),
  [complaints, search, selectedDept]);

  // ── Assign Officer ────────────────────────────────────────────────────────
  const handleAssign = async (complaintId, officerId) => {
    try {
      // ✅ Optimistic update
      setComplaints((prev) =>
        prev.map((c) => c.id === complaintId
          ? { ...c, assignedOfficer: officers.find((o) => o.id === officerId) }
          : c)
      );
      await api.post(`/api/admin/complaints/${complaintId}/assign-officer`, { officerId });
      toast.success("Officer assigned successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to assign officer. Try again."
      );
      fetchData(); // ✅ Revert on failure
    }
  };

  // ── Update Status ─────────────────────────────────────────────────────────
  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      setComplaints((prev) =>
        prev.map((c) => c.id === complaintId ? { ...c, status: newStatus } : c)
      );
      await api.put(`/api/admin/complaints/${complaintId}/status`, { status: newStatus });
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to update complaint status"
      );
      fetchData();
    }
  };

  // ── Update Priority ───────────────────────────────────────────────────────
  const handlePriorityChange = async (complaintId, newPriority) => {
    try {
      setComplaints((prev) =>
        prev.map((c) => c.id === complaintId ? { ...c, priority: newPriority } : c)
      );
      await api.put(`/api/admin/complaints/${complaintId}/priority`, { priority: newPriority });
      toast.success("Priority updated successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to update priority level"
      );
      fetchData();
    }
  };

  // ✅ Only show Cloudinary URLs — no BACKEND_URL prefix
  const handleOpenPreview = (url) => {
    if (!url) return;
    setPreviewUrl(url);
    setOpenPreview(true);
  };
  const handleClosePreview = () => { setOpenPreview(false); setPreviewUrl(""); };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: "var(--text-primary)", mb: 4 }}>
        Management Hub
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={5}>
        {[
          { label: "Complaints",      value: complaints.length,                                       icon: LifeBuoy,  color: "#2b50ff" },
          { label: "Total Officers",  value: officers.length,                                         icon: Users,     color: "#f97316" },
          { label: "Active Officers", value: officers.filter((o) => o.status === "AVAILABLE").length, icon: UserCheck, color: "#10b981" },
        ].map((item) => (
          <Grid item xs={12} sm={4} key={item.label}>
            <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "24px", border: "1px solid var(--border-soft)", boxShadow: "var(--card-shadow)", display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: `color-mix(in srgb, ${item.color} 12%, transparent)`, color: item.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <item.icon size={28} />
              </div>
              <div>
                <Typography variant="body2" fontWeight="600" color="var(--text-muted)" sx={{ textTransform: "uppercase" }}>{item.label}</Typography>
                <Typography variant="h4" fontWeight="800" sx={{ color: "var(--text-primary)" }}>{item.value}</Typography>
              </div>
            </div>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "24px", border: "1px solid var(--border-soft)", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", marginBottom: "2rem" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
          <Search size={20} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "0.85rem 1rem 0.85rem 3rem", borderRadius: "16px", border: "1px solid var(--border)", background: "var(--surface)", fontSize: "1rem", outline: "none", color: "var(--text-primary)", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Filter size={20} color="var(--text-muted)" />
          <TextField select size="small" label="Department" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} sx={{ width: 220, "& .MuiOutlinedInput-root": { borderRadius: "14px" } }}>
            <MenuItem value="">All Departments</MenuItem>
            {departments.map((dept) => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
          </TextField>
          {selectedDept && (
            <div style={{ padding: "0.5rem 1rem", borderRadius: "12px", background: availableOfficers.length ? "#dcfce7" : "#fee2e2", color: availableOfficers.length ? "#166534" : "#991b1b", fontWeight: "700", fontSize: "0.85rem" }}>
              {availableOfficers.length} Officers Available
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", borderRadius: "24px", border: "1px solid var(--border-soft)", boxShadow: "var(--card-shadow)", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
            <CircularProgress thickness={5} size={60} sx={{ color: "var(--primary)" }} />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "rgba(0,0,0,0.02)" }}>
                  {["ID", "COMPLAINT INFO", "STATUS", "PRIORITY", "ASSIGNED OFFICER", "EVIDENCE", "ACTION"].map((h, i) => (
                    <TableCell key={h} sx={{ fontWeight: "800", color: "var(--text-muted)", py: 2 }} align={i === 6 ? "right" : "left"}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredComplaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ py: 10, textAlign: "center", color: "var(--text-muted)" }}>
                      No matching complaints found.
                    </TableCell>
                  </TableRow>
                ) : filteredComplaints.map((c) => (
                  <TableRow key={c.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell sx={{ fontWeight: "800", color: "var(--primary)" }}>#{c.id}</TableCell>

                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="700">{c.title}</Typography>
                      {c.category && (
                        <Chip label={c.category} size="small" variant="outlined" sx={{ mt: 0.5, height: "20px", fontSize: "10px", fontWeight: "700" }} />
                      )}
                    </TableCell>

                    <TableCell>
                      <TextField select size="small" value={c.status || "PENDING"} onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        sx={{ width: 130, "& .MuiOutlinedInput-root": { borderRadius: "10px", fontWeight: "700", color: "#fff", backgroundColor: c.status === "PENDING" ? "#eddf28" : c.status === "IN_PROGRESS" ? "#287ce9" : c.status === "RESOLVED" ? "#0fb449" : "#ef1414" } }}>
                        {["PENDING", "IN_PROGRESS", "RESOLVED", "REOPENED"].map((s) => (
                          <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                      </TextField>
                    </TableCell>

                    <TableCell>
                      <TextField select size="small" value={c.priority || "MEDIUM"} onChange={(e) => handlePriorityChange(c.id, e.target.value)}
                        sx={{ width: 120, "& .MuiOutlinedInput-root": { borderRadius: "10px", fontWeight: "700", color: "#fff", backgroundColor: c.priority === "LOW" ? "#166534" : c.priority === "HIGH" ? "#991b1b" : "#f57636" } }}>
                        {["LOW", "MEDIUM", "HIGH"].map((p) => (
                          <MenuItem key={p} value={p}>{p}</MenuItem>
                        ))}
                      </TextField>
                    </TableCell>

                    <TableCell>
                      {c.assignedOfficer ? (
                        <div>
                          <span style={{ fontWeight: "700", display: "block" }}>{c.assignedOfficer.name}</span>
                          <span style={{ fontSize: "11px", color: c.assignedOfficer.status === "AVAILABLE" ? "#10b981" : "#ef4444", fontWeight: "700" }}>
                            ● {c.assignedOfficer.status}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontStyle: "italic", color: "var(--text-muted)" }}>Unassigned</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {/* ✅ Cloudinary URL — no BACKEND_URL prefix */}
                      {c.officerEvidenceUrl && c.officerEvidenceUrl.startsWith("https://") ? (
                        <div
                          style={{ position: "relative", width: "60px", height: "45px", cursor: "pointer" }}
                          onClick={() => handleOpenPreview(c.officerEvidenceUrl)}
                        >
                          <img
                            src={c.officerEvidenceUrl}
                            alt="Evidence"
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                            onError={(e) => { e.target.style.display = "none"; }} // ✅ Hide broken images
                          />
                        </div>
                      ) : "—"}
                    </TableCell>

                    <TableCell align="right">
                      {!c.assignedOfficer && selectedDept && c.category === selectedDept ? (
                        <Button
                          variant="contained"
                          size="small"
                          disabled={!availableOfficers.length}
                          onClick={() => handleAssign(c.id, availableOfficers[0].id)}
                          sx={{ borderRadius: "10px", textTransform: "none", fontWeight: "700", background: "linear-gradient(135deg, var(--primary), var(--primary-strong))" }}
                        >
                          Auto Assign
                        </Button>
                      ) : (
                        // ✅ Only show preview if valid Cloudinary URL
                        c.imageUrl && c.imageUrl.startsWith("https://") ? (
                          <IconButton size="small" onClick={() => handleOpenPreview(c.imageUrl)}>
                            <ExternalLink size={18} />
                          </IconButton>
                        ) : null
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      {/* Image Preview Dialog */}
      <Dialog
        open={openPreview}
        onClose={handleClosePreview}
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: "24px", overflow: "hidden" } }}
      >
        <DialogContent sx={{ position: "relative", p: 0 }}>
          <IconButton
            sx={{ position: "absolute", top: 12, right: 12, zIndex: 10, bgcolor: "rgba(0,0,0,0.5)", color: "white", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}
            onClick={handleClosePreview}
          >
            <CloseIcon />
          </IconButton>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              style={{ width: "100%", height: "auto", display: "block" }}
              onError={(e) => { e.target.src = ""; e.target.alt = "Image not available"; }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AllComplaints;