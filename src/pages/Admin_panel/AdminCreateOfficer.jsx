import React, { useState } from "react";
import {
  Box, Typography, TextField, Button,
  InputAdornment, Grid, MenuItem, CircularProgress,
} from "@mui/material";
import {
  User, Mail, Lock, Phone, Building2, UserPlus, MapPin,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../api/axios"; // ✅ Use configured axios instance

// ✅ Match backend ComplaintCategory enum exactly
const DEPARTMENTS = [
  { label: "Electricity", value: "ELECTRICITY" },
  { label: "Water",       value: "WATER" },
  { label: "Roads",       value: "ROAD" },
  { label: "Sanitation",  value: "SANITATION" },
  { label: "Traffic",     value: "TRAFFIC" },
  { label: "Other",       value: "OTHER" },
];

const EMPTY_FORM = {
  name: "", email: "", password: "",
  phoneNo: "", address: "", age: "", department: "",
};

const AdminCreateOfficer = () => {
  const [officerData, setOfficerData] = useState(EMPTY_FORM);
  const [loading, setLoading]         = useState(false); // ✅ Loading state

  const handleChange = (e) => {
    setOfficerData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const { name, email, password, phoneNo, address, age, department } = officerData;

    if (!name.trim())       { toast.warn("Full name is required");       return false; }
    if (!email.trim())      { toast.warn("Email is required");            return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.warn("Enter a valid email address"); return false;
    }
    if (!password)          { toast.warn("Password is required");         return false; }
    if (password.length < 6){ toast.warn("Password must be at least 6 characters"); return false; }
    if (!phoneNo.trim())    { toast.warn("Phone number is required");     return false; }
    if (!/^[6-9]\d{9}$/.test(phoneNo)) {
      toast.warn("Enter a valid 10-digit Indian phone number"); return false;
    }
    if (!address.trim())    { toast.warn("Address is required");          return false; }
    if (!age || Number(age) < 18 || Number(age) > 65) {
      toast.warn("Age must be between 18 and 65"); return false;
    }
    if (!department)        { toast.warn("Please select a department");   return false; }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // ✅ Use api instance — no manual token or API_URL needed
      await api.post("/api/admin/create-officer", {
        ...officerData,
        age: Number(officerData.age),
        email: officerData.email.trim().toLowerCase(),
        name: officerData.name.trim(),
      });

      toast.success("Officer account created successfully!");
      setOfficerData(EMPTY_FORM);

    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to create officer. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", background: "var(--surface)", padding: "3rem", borderRadius: "32px", border: "1px solid var(--border-soft)", boxShadow: "var(--card-shadow)" }}>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Box sx={{ padding: "12px", borderRadius: "16px", background: "color-mix(in srgb, var(--primary) 10%, transparent)", color: "var(--primary)" }}>
          <UserPlus size={32} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: "var(--text-primary)" }}>
            Add Officer
          </Typography>
          <Typography variant="body2" color="var(--text-muted)" fontWeight="600">
            Create a new department official account
          </Typography>
        </Box>
      </Box>

      {/* Form */}
      <Grid container spacing={3}>
        {[
          { label: "Full Name",    name: "name",     icon: User,   type: "text",     md: 6 },
          { label: "Email",        name: "email",    icon: Mail,   type: "email",    md: 6 },
          { label: "Password",     name: "password", icon: Lock,   type: "password", md: 6 },
          { label: "Phone Number", name: "phoneNo",  icon: Phone,  type: "tel",      md: 6 },
          { label: "Address",      name: "address",  icon: MapPin, type: "text",     md: 12 },
          { label: "Age",          name: "age",      icon: User,   type: "number",   md: 6 },
        ].map((field) => (
          <Grid item xs={12} md={field.md} key={field.name}>
            <TextField
              fullWidth
              label={field.label}
              name={field.name}
              type={field.type}
              value={officerData[field.name]}
              onChange={handleChange}
              disabled={loading}
              inputProps={{
                maxLength: field.name === "phoneNo" ? 10 : undefined,
                min: field.name === "age" ? 18 : undefined,
                max: field.name === "age" ? 65 : undefined,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <field.icon size={20} />
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
            />
          </Grid>
        ))}

        {/* Department */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth select
            label="Department"
            name="department"
            value={officerData.department}
            onChange={handleChange}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Building2 size={20} />
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          >
            <MenuItem value="">Select a department...</MenuItem>
            {DEPARTMENTS.map((dept) => (
              // ✅ Use enum value — matches backend ComplaintCategory
              <MenuItem key={dept.value} value={dept.value}>
                {dept.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Button
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        onClick={handleSubmit}
        sx={{ mt: 4, py: 1.8, borderRadius: "16px", fontWeight: "700", textTransform: "none", background: loading ? undefined : "linear-gradient(135deg, var(--primary), var(--primary-strong))" }}
      >
        {loading
          ? <><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> Creating...</>
          : "Generate Officer Account"
        }
      </Button>
    </Box>
  );
};

export default AdminCreateOfficer;