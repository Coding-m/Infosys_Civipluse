import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Grid, InputAdornment,
} from "@mui/material";
import { User, Mail } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const AdminProfile = () => {
  const [user, setUser]       = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);

  // ── Fetch profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({ name: res.data.name || "", email: res.data.email || "" });
      } catch {
        toast.error("Failed to fetch profile");
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
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${API_URL}/api/admin/profile`,
        { name: user.name, email: user.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (loading) return <p>Loading profile...</p>;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight="800" sx={{ mb: 4, color: "var(--text-primary)" }}>
        Account Settings
      </Typography>

      <div style={{ background: "var(--surface)", borderRadius: "32px", border: "1px solid var(--border-soft)", boxShadow: "var(--card-shadow)", padding: "3rem" }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Full Name" name="name" type="text"
                value={user.name} onChange={handleChange} variant="outlined"
                InputProps={{ startAdornment: <InputAdornment position="start"><User size={20} color="var(--text-muted)" /></InputAdornment> }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" }, "& .MuiInputLabel-root": { color: "var(--text-muted)" }, "& .MuiInputLabel-root.Mui-focused": { color: "var(--primary)" } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Email Address" name="email" type="email"
                value={user.email} onChange={handleChange} variant="outlined" disabled
                InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={20} color="var(--text-muted)" /></InputAdornment> }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" }, "& .MuiInputLabel-root": { color: "var(--text-muted)" }, "& .MuiInputLabel-root.Mui-focused": { color: "var(--primary)" } }}
              />
            </Grid>
          </Grid>

          <Box display="flex" gap={2} mt={5}>
            <Button
              variant="contained" size="large" type="submit"
              sx={{ borderRadius: "16px", px: 5, py: 1.8, textTransform: "none", fontSize: "1rem", fontWeight: "700", background: "linear-gradient(135deg, var(--primary), var(--primary-strong))", color: "#fff", "&:hover": { transform: "translateY(-1px)" } }}
            >
              Save Changes
            </Button>
          </Box>
        </form>
      </div>
    </Box>
  );
};

export default AdminProfile;