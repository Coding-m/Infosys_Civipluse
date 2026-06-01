import api from "./axios";

// ── COMPLAINTS ─────────────────────────────────────────────────────────────
export const fetchAdminComplaints = (search, status, priority) =>
  api.get("/api/admin/complaints", {
    params: { search, status, priority },
  });

export const fetchComplaintById = (id) =>
  api.get(`/api/admin/complaints/${id}`);

export const assignOfficer = (complaintId, officerId) =>
  api.post(`/api/admin/complaints/${complaintId}/assign-officer`, {
    officerId,
  });

export const updateComplaintStatus = (complaintId, status) =>
  api.put(`/api/admin/complaints/${complaintId}/status`, { status });

export const updateComplaintStage = (complaintId, stage) =>
  api.put(`/api/admin/complaints/${complaintId}/stage`, null, {
    params: { stage },
  });

export const updateComplaintPriority = (complaintId, priority) =>
  api.put(`/api/admin/complaints/${complaintId}/priority`, { priority });

export const deleteComplaint = (complaintId, reason) =>
  api.delete(`/api/admin/complaints/${complaintId}`, {
    data: { reason },
  });

export const fetchOfficerWorkload = () =>
  api.get("/api/admin/complaints/officers/workload");

// ── FEEDBACK ───────────────────────────────────────────────────────────────
export const fetchAllFeedback = () =>
  api.get("/api/admin/feedback/all");

// ── OFFICER MANAGEMENT ─────────────────────────────────────────────────────
export const createOfficer = (formData) =>
  api.post("/api/admin/create-officer", formData);

export const resetOfficerPassword = (formData) =>
  api.post("/api/admin/reset-officer-password", formData);

// ── OFFICER UPDATE REQUESTS ────────────────────────────────────────────────
export const fetchPendingOfficerRequests = () =>
  api.get("/api/admin/officer-update-requests");

export const approveOfficerRequest = (id) =>
  api.put(`/api/admin/officer-update-requests/${id}/approve`);

export const rejectOfficerRequest = (id, reason) =>
  api.put(`/api/admin/officer-update-requests/${id}/reject`, { reason });

// ── ADMIN PROFILE ──────────────────────────────────────────────────────────
export const fetchAdminProfile = () =>
  api.get("/api/admin/profile");

export const updateAdminProfile = (name) =>
  api.put("/api/admin/profile", { name });

// ── AUTH ───────────────────────────────────────────────────────────────────
export const adminForgotPassword = (email) =>
  api.post("/api/admin/forgot-password", { email });

export const adminResetPassword = (formData) =>
  api.post("/api/admin/reset-password", formData);