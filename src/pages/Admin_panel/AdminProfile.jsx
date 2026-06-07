import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button,
  Grid, InputAdornment, CircularProgress,
} from "@mui/material";
import { User, Mail } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../api/axios"; // ✅ Use configured axios instance

const AdminProfile = () => {
  const [user, setUser]         = useState({ name: "", email: "" });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  // ── Fetch Profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // ✅ Removed manual token + API_URL
        const res = await api.get("/api/admin/profile");
        setUser({
          name:  res.data.name  || "",
          email: res.data.email || "",
        });
      } catch (error) {
        if (error?.response?.status !== 401) {
          toast.error(
            error?.response?.data?.message ||
            "Failed to fetch profile"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validate name
    if (!user.name.trim() || user.name.trim().length < 2) {
      toast.warn("Name must be at least 2 characters");
      return;
    }

    setSaving(true);
    try {
      // ✅ Only send name — email cannot be changed
      await api.put("/api/admin/profile", { name: user.name.trim() });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 8 }}>
        <CircularProgress sx={{ color: "var(--primary)" }} />
      </Box>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight="800" sx={{ mb: 4, color: "var(--text-primary)" }}>
        Account Settings
      </Typography>

      <div style={{ background: "var(--surface)", borderRadius: "32px", border: "1px solid var(--border-soft)", boxShadow: "var(--card-shadow)", padding: "3rem" }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>

            {/* Name — editable */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                type="text"
                value={user.name}
                onChange={handleChange}
                disabled={saving}
                inputProps={{ maxLength: 100 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={20} color="var(--text-muted)" />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
              />
            </Grid>

            {/* Email — read only */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={user.email}
                disabled // ✅ Email cannot be changed
                helperText="Email cannot be changed"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} color="var(--text-muted)" />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
              />
            </Grid>
          </Grid>

          <Box display="flex" gap={2} mt={5}>
            <Button
              variant="contained"
              size="large"
              type="submit"
              disabled={saving}
              sx={{
                borderRadius: "16px",
                px: 5, py: 1.8,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: "700",
                background: saving
                  ? undefined
                  : "linear-gradient(135deg, var(--primary), var(--primary-strong))",
                color: "#fff",
              }}
            >
              {saving
                ? <><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> Saving...</>
                : "Save Changes"
              }
            </Button>
          </Box>
        </form>
      </div>
    </Box>
  );
};

export default AdminProfile;