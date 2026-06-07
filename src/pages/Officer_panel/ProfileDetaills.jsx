import React, { useState, useEffect } from "react";
import { Camera, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import {
  Box, Typography, TextField, Button,
  Avatar, Grid, CircularProgress,
} from "@mui/material";
import api from "../../api/axios"; // ✅ Use configured axios instance

const EditProfile = () => {
  const [user, setUser]       = useState({
    name: "", email: "", phoneNo: "",
    department: "", role: "", address: "", age: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});

  // ── Fetch Profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // ✅ Removed manual token + API_URL
        const res = await api.get("/api/officer/profile");
        setUser((prev) => ({ ...prev, ...res.data }));

        // ✅ Show rejection reason if present
        if (res.data.lastRejectedReason) {
          toast.warn(
            `Previous update rejected: "${res.data.lastRejectedReason}"`
          );
        }
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

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!user.name?.trim() || user.name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters";

    if (user.phoneNo && !/^[6-9]\d{9}$/.test(user.phoneNo))
      newErrors.phoneNo = "Enter a valid 10-digit Indian phone number";

    if (user.age && (Number(user.age) < 18 || Number(user.age) > 65))
      newErrors.age = "Age must be between 18 and 65";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    // ✅ Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      // ✅ Officer profile update goes through admin approval
      await api.put("/api/officer/profile", {
        name:    user.name?.trim(),
        phoneNo: user.phoneNo,
        address: user.address?.trim(),
        age:     Number(user.age) || 0,
      });
      toast.success("Profile update request submitted for admin approval!");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to submit profile update"
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
    <Box sx={{ p: { xs: 2, md: 0 } }}>
      <Typography variant="h4" fontWeight="800" sx={{ mb: 4, color: "var(--text-primary)" }}>
        Officer Settings
      </Typography>

      <div style={{ background: "var(--surface)", borderRadius: "32px", border: "1px solid var(--border-soft)", boxShadow: "var(--card-shadow)", overflow: "hidden" }}>
        <div style={{ padding: "3rem" }}>

          {/* Profile Header */}
          <Box display="flex" alignItems="center" gap={3} mb={5} flexWrap="wrap">
            <div style={{ position: "relative" }}>
              <Avatar
                sx={{ width: 120, height: 120, border: "4px solid var(--border-soft)", boxShadow: "var(--card-shadow)", bgcolor: "var(--primary)", fontSize: "2.5rem", fontWeight: "800" }}
              >
                {/* ✅ Removed avatar upload — no backend support for it */}
                {user.name?.charAt(0)?.toUpperCase() || "O"}
              </Avatar>
              {/* ✅ Camera icon as decoration only — no upload */}
              <div style={{ position: "absolute", bottom: "4px", right: "4px", background: "var(--surface)", padding: "8px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-soft)" }}>
                <Camera size={18} color="var(--primary)" />
              </div>
            </div>

            <div>
              <Typography variant="h4" fontWeight="800" color="var(--text-primary)" gutterBottom>
                {user.name || "Officer"}
              </Typography>
              <Typography variant="body1" color="var(--text-muted)" fontWeight="600" sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <ShieldCheck size={18} />
                {user.role || "OFFICER"} • {user.department || "—"}
              </Typography>
            </div>
          </Box>

          {/* ✅ Info about approval process */}
          <Box sx={{ mb: 3, p: 2, borderRadius: "12px", background: "color-mix(in srgb, var(--primary) 5%, transparent)", border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)" }}>
            <Typography variant="body2" color="var(--primary)" fontWeight="600">
              ℹ️ Profile updates require admin approval before taking effect
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>

              {/* Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth label="Full Name" name="name"
                  value={user.name} onChange={handleChange}
                  disabled={saving}
                  error={!!errors.name}
                  helperText={errors.name}
                  inputProps={{ maxLength: 100 }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                />
              </Grid>

              {/* Email — read only */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth label="Email" name="email"
                  value={user.email}
                  disabled // ✅ Email cannot be changed
                  helperText="Email cannot be changed"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth label="Phone Number" name="phoneNo"
                  value={user.phoneNo} onChange={handleChange}
                  disabled={saving}
                  error={!!errors.phoneNo}
                  helperText={errors.phoneNo}
                  inputProps={{ maxLength: 10 }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                />
              </Grid>

              {/* Address */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth label="Address" name="address"
                  value={user.address} onChange={handleChange}
                  disabled={saving}
                  inputProps={{ maxLength: 200 }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                />
              </Grid>

              {/* Age */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth label="Age" name="age" type="number"
                  value={user.age} onChange={handleChange}
                  disabled={saving}
                  error={!!errors.age}
                  helperText={errors.age}
                  inputProps={{ min: 18, max: 65 }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                />
              </Grid>

              {/* Department — read only */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth label="Department"
                  value={user.department || "—"}
                  disabled // ✅ Department cannot be changed by officer
                  helperText="Department is assigned by admin"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                />
              </Grid>
            </Grid>

            <Box display="flex" gap={2} mt={5}>
              <Button
                variant="contained"
                size="large"
                type="submit"
                disabled={saving}
                sx={{ borderRadius: "14px", px: 4, py: 1.5, textTransform: "none", fontWeight: "700", background: saving ? undefined : "linear-gradient(135deg, var(--primary), var(--primary-strong))" }}
              >
                {saving
                  ? <><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> Submitting...</>
                  : "Request Profile Update"
                }
              </Button>
            </Box>
          </form>
        </div>
      </div>
    </Box>
  );
};

export default EditProfile;