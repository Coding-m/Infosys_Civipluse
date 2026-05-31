import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Grid, Card, CardMedia, CardContent, Typography, Box,
  Chip, CardActions, Button, Modal, LinearProgress,
} from "@mui/material";
import { statusColor, priorityColor } from "./helpers";

const API_URL = import.meta.env.VITE_API_URL;

const getProgressByStatus = (status) => {
  switch (status) {
    case "PENDING":     return 0;
    case "ASSIGNED":    return 10;
    case "IN_PROGRESS": return 50;
    case "ESCALATED":   return 75;
    case "RESOLVED":    return 100;
    default:            return 0;
  }
};

const AllComplaintsCards = ({ complaints, handleViewDetails }) => {
  const [previewImage, setPreviewImage] = useState(null);

  return (
    <>
      <Grid container spacing={3} className="complaints-grid">
        {complaints.length === 0 && (
          <Typography sx={{ mt: 3, mx: 2, fontStyle: "italic" }}>No complaints yet</Typography>
        )}

        {complaints.map((c) => {
          const isResolved = c.status === "RESOLVED";
          const progress   = getProgressByStatus(c.status);
          const imageUrl   = c.imageUrl ? `${API_URL}${c.imageUrl}` : "https://via.placeholder.com/400x200";

          return (
            <Grid item xs={12} sm={6} md={4} key={c.id}>
              <Card sx={{ borderRadius: 3, boxShadow: 6, transition: "0.3s", "&:hover": { boxShadow: 12, transform: "translateY(-3px)" }, display: "flex", flexDirection: "column", minHeight: 440, backgroundColor: isResolved ? "#e6f4ea" : "white", position: "relative" }}>

                {c.priority === "HIGH" && (
                  <Box sx={{ position: "absolute", top: 22, right: -55, transform: "rotate(45deg)", bgcolor: "error.main", color: "white", px: 4, py: 1.5, fontWeight: "bold", fontSize: 14, zIndex: 2, boxShadow: "2px 2px 8px rgba(0,0,0,0.5)", borderRadius: 1 }}>
                    HIGH PRIORITY
                  </Box>
                )}

                <CardMedia
                  component="img"
                  height="200"
                  image={imageUrl}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/400x200"; }}
                  sx={{ borderTopLeftRadius: 12, borderTopRightRadius: 12, cursor: "pointer" }}
                  onClick={() => c.imageUrl && setPreviewImage(imageUrl)}
                />

                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                    <Chip label={c.category} size="small" color="primary" />
                    <Chip label={c.status}   size="small" color={statusColor(c.status)} />
                    <Chip label={c.priority} size="small" color={priorityColor(c.priority)} />
                  </Box>

                  <Typography fontWeight="bold" variant="h6" gutterBottom>
                    #{c.id} {c.title}
                  </Typography>

                  <Typography variant="body2" color="gray">
                    {isResolved
                      ? `Resolved on ${c.resolutionDate ? new Date(c.resolutionDate).toLocaleDateString() : "-"}`
                      : "Pending Resolution"}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">Progress: {progress}%</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ height: 8, borderRadius: 5, mt: 0.5, backgroundColor: "#eee", "& .MuiLinearProgress-bar": { backgroundColor: c.status === "RESOLVED" ? "#2e7d32" : c.status === "ESCALATED" ? "#ed6c02" : "#1976d2" } }}
                    />
                  </Box>
                </CardContent>

                <CardActions>
                  <Button
                    fullWidth variant="contained" size="small" color="primary"
                    disabled={isResolved}
                    onClick={() => !isResolved && handleViewDetails(c)}
                    sx={{ bgcolor: isResolved ? "gray" : "#1976d2", "&:hover": { bgcolor: isResolved ? "gray" : "#115293" }, fontWeight: "bold" }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Modal open={!!previewImage} onClose={() => setPreviewImage(null)} sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
        <Box component="img" src={previewImage} alt="Preview" sx={{ maxHeight: "60%", maxWidth: "60%", borderRadius: 2, boxShadow: 12 }} />
      </Modal>
    </>
  );
};

AllComplaintsCards.propTypes = {
  complaints:        PropTypes.array.isRequired,
  handleViewDetails: PropTypes.func.isRequired,
};

export default AllComplaintsCards;