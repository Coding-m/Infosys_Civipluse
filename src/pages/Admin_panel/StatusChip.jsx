import React from "react";
import PropTypes from "prop-types";
import { Chip } from "@mui/material";

const statusColors = {
  PENDING:     "warning",
  ESCALATED:   "error",
  IN_PROGRESS: "info",
  RESOLVED:    "success",
};

export default function StatusChip({ status }) {
  return (
    <Chip
      label={status.replace("_", " ")}
      color={statusColors[status] || "default"}
      size="small"
    />
  );
}

StatusChip.propTypes = {
  status: PropTypes.string.isRequired,
};