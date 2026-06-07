import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box, Modal, Typography, TextField, Button,
  Divider, MenuItem, CircularProgress,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "react-toastify"; // ✅ Replace Snackbar with toast
import api from "../../api/axios"; // ✅ Use configured axios instance
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon   from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
});

const modalStyle = {
  position: "absolute", top: "50%", left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 600 }, // ✅ Responsive width
  bgcolor: "var(--surface)",
  borderRadius: "20px",
  boxShadow: "0 50px 100px rgba(0,0,0,0.3)",
  p: 3,
  maxHeight: "90vh",
  overflowY: "auto",
};

const STATUS_OPTIONS  = ["PENDING", "IN_PROGRESS", "RESOLVED"];
const MAX_FILE_SIZE   = 5 * 1024 * 1024; // 5MB — matches backend
const ALLOWED_TYPES   = ["image/png", "image/jpeg", "image/jpg"];

const UpdateGrievanceModal = ({ open, onClose, grievance, onSubmit }) => {
  const data       = useMemo(() => grievance || {}, [grievance]);
  const isResolved = data.status === "RESOLVED";

  const [expectedDate, setExpectedDate] = useState("");
  const [remarks, setRemarks]           = useState("");
  const [status, setStatus]             = useState("PENDING");
  const [photo, setPhoto]               = useState(null);
  const [photoError, setPhotoError]     = useState(""); // ✅ File validation error
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    if (!open) return; // ✅ Only reset when modal opens
    setExpectedDate(
      data.expectedCompletionDate
        ? new Date(data.expectedCompletionDate).toISOString().split("T")[0]
        : ""
    );
    setRemarks(data.officerRemark || "");
    setStatus(data.status || "PENDING");
    setPhoto(null);
    setPhotoError("");
  }, [data, open]);

  const originalDate = data.expectedCompletionDate
    ? new Date(data.expectedCompletionDate).toISOString().split("T")[0]
    : "";

  const isDirty =
    remarks      !== (data.officerRemark || "") ||
    expectedDate !== originalDate ||
    status       !== (data.status || "PENDING") ||
    !!photo;

  // ✅ File validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setPhotoError("Only PNG/JPG images allowed");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setPhotoError("File must be less than 5MB");
      e.target.value = "";
      return;
    }

    setPhoto(file);
    setPhotoError("");
  };

  const handleSubmit = async () => {
    if (!isDirty || isResolved) return;

    setLoading(true);
    try {
      // ✅ Build query params for fields that changed
      const params = {};
      if (remarks      !== (data.officerRemark || "")) params.remark       = remarks;
      if (status       !== (data.status || "PENDING")) params.status       = status;
      if (expectedDate !== originalDate)               params.expectedDate = expectedDate;

      // ✅ Use api instance — no manual token or API_URL
      if (Object.keys(params).length > 0) {
        await api.put(
          `/api/officer/complaints/${data.id}`,
          null,
          { params }
        );
      }

      // ✅ Upload evidence if provided
      if (photo) {
        const formData = new FormData();
        formData.append("file", photo);
        await api.post(
          `/api/officer/complaints/${data.id}/evidence`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 60000, // ✅ 60s for Cloudinary upload
          }
        );
      }

      toast.success("Complaint updated successfully");
      await onSubmit?.();
      onClose();

    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Update failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose} // ✅ Prevent close while saving
    >
      <Box sx={modalStyle}>
        <Typography variant="h6" fontWeight="bold" color="var(--text-primary)">
          Update Complaint
        </Typography>
        <Divider sx={{ my: 2 }} />

        {/* Complaint Info */}
        <Typography variant="body2" sx={{ mb: 1, color: "var(--text-primary)" }}>
          <strong>Assigned Date:</strong>{" "}
          {data.assignedDate
            ? new Date(data.assignedDate).toLocaleDateString()
            : "—"}
        </Typography>

        <Typography variant="body2" sx={{ mb: 1, color: "var(--text-primary)" }}>
          <strong>Description:</strong> {data.description || "—"}
        </Typography>

        <Typography variant="body2" sx={{ mb: 1, color: "var(--text-primary)" }}>
          <strong>Location:</strong> {data.location || "—"}
        </Typography>

        {/* Map */}
        {data.latitude && data.longitude && (
          <Box sx={{ height: 150, mb: 2, borderRadius: "12px", overflow: "hidden" }}>
            <MapContainer
              center={[data.latitude, data.longitude]}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[data.latitude, data.longitude]}>
                <Popup>{data.location}</Popup>
              </Marker>
            </MapContainer>
          </Box>
        )}

        {/* ✅ Show resolved message */}
        {isResolved && (
          <Typography
            variant="body2"
            sx={{ mb: 2, p: 1.5, borderRadius: "10px", background: "rgba(16,185,129,0.1)", color: "#10b981", fontWeight: 600 }}
          >
            This complaint is resolved — no further updates allowed
          </Typography>
        )}

        {/* Expected Date */}
        <TextField
          label="Expected Completion Date"
          type="date"
          fullWidth
          disabled={isResolved || loading}
          value={expectedDate}
          onChange={(e) => setExpectedDate(e.target.value)}
          inputProps={{ min: new Date().toISOString().split("T")[0] }} // ✅ No past dates
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
        />

        {/* Remarks */}
        <TextField
          label="Officer Remark"
          multiline
          rows={3}
          fullWidth
          disabled={isResolved || loading}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          inputProps={{ maxLength: 300 }}
          helperText={`${remarks.length}/300`}
          sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
        />

        {/* Evidence Upload */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5, color: "var(--text-primary)" }}>
            Upload Evidence (PNG/JPG, max 5MB)
          </Typography>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            disabled={isResolved || loading}
            onChange={handleFileChange}
            style={{ width: "100%" }}
          />
          {photo && !photoError && (
            <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: "block" }}>
              ✓ {photo.name} ({(photo.size / 1024 / 1024).toFixed(2)} MB)
            </Typography>
          )}
          {photoError && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
              {photoError}
            </Typography>
          )}
        </Box>

        {/* Status */}
        <TextField
          select
          label="Status"
          fullWidth
          disabled={isResolved || loading}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
        >
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>

        {/* Actions */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outlined"
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={loading || isResolved || !isDirty || !!photoError}
            onClick={handleSubmit}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, background: "linear-gradient(135deg, var(--primary), var(--primary-strong))" }}
          >
            {loading
              ? <><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> Saving...</>
              : "Save Changes"
            }
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

UpdateGrievanceModal.propTypes = {
  open:      PropTypes.bool.isRequired,
  onClose:   PropTypes.func.isRequired,
  grievance: PropTypes.object,
  onSubmit:  PropTypes.func.isRequired,
};

export default UpdateGrievanceModal;