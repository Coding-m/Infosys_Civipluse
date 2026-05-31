import React, { useState } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogTitle, DialogContent, TextField, Button } from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

export default function EditResolutionModal({ complaint, onClose, refresh }) {
  const [date, setDate]       = useState(complaint.resolutionDate || "");
  const [saving, setSaving]   = useState(false);

  const updateDate = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${API_URL}/api/admin/complaints/${complaint.id}/resolution-date`,
        { resolutionDate: date },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Resolution date updated");
      refresh();
      onClose();
    } catch {
      toast.error("Failed to update resolution date");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Edit Resolution Date</DialogTitle>
      <DialogContent>
        <TextField
          type="date"
          fullWidth
          value={date}
          onChange={(e) => setDate(e.target.value)}
          sx={{ mt: 1 }}
        />
        <Button
          fullWidth
          variant="contained"
          disabled={saving}
          sx={{ mt: 2 }}
          onClick={updateDate}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

EditResolutionModal.propTypes = {
  complaint: PropTypes.shape({
    id:             PropTypes.number.isRequired,
    resolutionDate: PropTypes.string,
  }).isRequired,
  onClose:  PropTypes.func.isRequired,
  refresh:  PropTypes.func.isRequired,
};