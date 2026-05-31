import React from "react";
import PropTypes from "prop-types";
import { Dialog, DialogContent } from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL;

export default function ImagePreviewModal({ open, onClose, image }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogContent>
        <img
          src={`${API_URL}${image}`}
          alt="Complaint"
          style={{ width: "100%", borderRadius: 8 }}
        />
      </DialogContent>
    </Dialog>
  );
}

ImagePreviewModal.propTypes = {
  open:    PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  image:   PropTypes.string.isRequired,
};