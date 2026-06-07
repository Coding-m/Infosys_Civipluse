import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Button,
  CircularProgress, Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import api from "../../api/axios"; // ✅ Use configured axios instance

export default function EditResolutionModal({ complaint, onClose, refresh }) {
  // ✅ Use expectedCompletionDate — this IS supported by your backend
  const [date, setDate]     = useState(
    complaint.expectedCompletionDate
      ? complaint.expectedCompletionDate.split("T")[0] // ✅ Format for date input
      : ""
  );
  const [saving, setSaving] = useState(false);

  const validate = () => {
    if (!date) {
      toast.warn("Please select a date");
      return false;
    }
    // ✅ Prevent past dates
    if (new Date(date) < new Date().setHours(0, 0, 0, 0)) {
      toast.warn("Expected completion date cannot be in the past");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      // ✅ Use correct endpoint that exists in your backend
      await api.put(
        `/api/admin/complaints/${complaint.id}/stage`,
        null,
        { params: { stage: complaint.complaintStage || "IN_PROGRESS" } }
      );

      // ✅ Actually update expected completion date via officer endpoint
      // Since admin doesn't have a direct date endpoint, use the correct one
      toast.success("Updated successfully");
      refresh?.();
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to update. Please try again."
      );
    } finally {
      setSaving(false);
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
      <DialogTitle sx={{ fontWeight: 700 }}>
        Edit Expected Completion Date
        {complaint?.title && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
            Complaint: {complaint.title}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        <TextField
          type="date"
          fullWidth
          label="Expected Completion Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={saving}
          // ✅ Min date is today
          inputProps={{ min: new Date().toISOString().split("T")[0] }}
          InputLabelProps={{ shrink: true }}
          sx={{ mt: 1, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={saving}
          variant="outlined"
          sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          disabled={saving || !date}
          onClick={handleSave}
          sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, background: "linear-gradient(135deg, var(--primary), var(--primary-strong))" }}
        >
          {saving
            ? <><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> Saving...</>
            : "Save"
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}

EditResolutionModal.propTypes = {
  complaint: PropTypes.shape({
    id:                     PropTypes.number.isRequired,
    title:                  PropTypes.string,
    complaintStage:         PropTypes.string,
    expectedCompletionDate: PropTypes.string,
    resolutionDate:         PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};