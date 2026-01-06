import React, { useState } from "react";
import {
  Box,
  Modal,
  Typography,
  TextField,
  Button,
  Input,
  Divider,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";

// Fix Leaflet default marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 3,
};

const statusOptions = ["PENDING", "IN_PROGRESS", "RESOLVED"];

const UpdateGrievanceModal = ({ open, onClose, grievance, onSubmit }) => {
  const data = grievance || {};
  const isResolved = data.status === "RESOLVED";

  const [expectedDate, setExpectedDate] = useState(
    data.expectedCompletionDate ? new Date(data.expectedCompletionDate).toISOString().split("T")[0] : ""
  );
  const [remarks, setRemarks] = useState(data.remarks || "");
  const [status, setStatus] = useState(data.status || "PENDING");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });


 console.log("Grievance data:", data);


  // Check if any field changed
  const isDirty =
    remarks !== (data.remarks || "") ||
    expectedDate !== (data.expectedCompletionDate ? new Date(data.expectedCompletionDate).toISOString().split("T")[0] : "") ||
    status !== (data.status || "PENDING") ||
    photo;

  const handleSubmit = async () => {
    if (!isDirty) return; // nothing to update
    setLoading(true);
    const token = localStorage.getItem("token");
    let failed = false;

    try {
      // 1️⃣ Update remark
      if (remarks !== data.remarks && remarks) {
        try {
          await axios.put(
            `http://localhost:8081/api/officer/complaints/${data.id}/remark`,
            null,
            { params: { remark: remarks }, headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          console.error("Remark update failed", err);
          failed = true;
        }
      }

      // 2️⃣ Update expected completion
      if (expectedDate !== (data.expectedCompletionDate ? new Date(data.expectedCompletionDate).toISOString().split("T")[0] : "") && expectedDate) {
        try {
          await axios.put(
            `http://localhost:8081/api/officer/complaints/${data.id}/expected-completion`,
            null,
            { params: { expectedDateTime: expectedDate }, headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          console.error("Expected date update failed", err);
          failed = true;
        }
      }

      // 3️⃣ Update status
      if (status !== data.status && status) {
        try {
          await axios.put(
            `http://localhost:8081/api/officer/complaints/${data.id}/status`,
            null,
            { params: { status }, headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          console.error("Status update failed", err);
          failed = true;
        }
      }

      // 4️⃣ Upload evidence
      if (photo) {
        const formData = new FormData();
        formData.append("file", photo);
        try {
          await axios.post(
            `http://localhost:8081/api/officer/complaints/${data.id}/evidence`,
            formData,
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
          );
        } catch (err) {
          console.error("Evidence upload failed", err);
          failed = true;
        }
      }

      // Show toast based on result
      if (failed) {
        setSnackbar({ open: true, message: "Some updates failed", severity: "error" });
      } else {
        setSnackbar({ open: true, message: "Complaint updated successfully", severity: "success" });
        onClose();
        await onSubmit(); // refresh parent list
      }

    } catch (err) {
      console.error("Unexpected error", err);
      setSnackbar({ open: true, message: "Update failed", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" fontWeight="bold">
            Update Complaint
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Assigned Date:</strong>{" "}
            {data.assignedDate ? new Date(data.assignedDate).toLocaleDateString() : "-"}
          </Typography>

          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Description:</strong> {data.description || "-"}
          </Typography>

          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Location:</strong> {data.location || "-"}
          </Typography>

          {data.latitude && data.longitude && (
            <Box sx={{ height: 150, mb: 2 }}>
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

          <TextField
            label="Expected Completion Date"
            type="date"
            fullWidth
            disabled={isResolved}
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Officer Remark"
            multiline
            rows={3}
            fullWidth
            disabled={isResolved}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            inputProps={{ maxLength: 300 }}
            helperText={`${remarks.length}/300`}
            sx={{ mb: 2 }}
          />

          <Input
            type="file"
            disabled={isResolved}
            onChange={(e) => setPhoto(e.target.files[0])}
            sx={{ mb: 1 }}
          />
          {photo && <Typography variant="body2" sx={{ mb: 2 }}>{photo.name}</Typography>}

          <TextField
            select
            label="Status"
            fullWidth
            disabled={isResolved}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ mb: 3 }}
          >
            {statusOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant="contained"
              disabled={loading || isResolved || !isDirty}
              onClick={handleSubmit}
            >
              {loading ? <CircularProgress size={20} /> : "Save Changes"}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity || "info"}>{snackbar.message}</Alert>
      </Snackbar>
    </>
   
  );
};

export default UpdateGrievanceModal;
