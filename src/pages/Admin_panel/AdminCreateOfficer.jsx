import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Grid
} from "@mui/material";
import {
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  UserPlus
} from "lucide-react";
import { toast } from "react-toastify";

const AdminCreateOfficer = () => {
  const [officerData, setOfficerData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNo: "",
    department: "",
  });

  const handleChange = (e) => {
    setOfficerData({ ...officerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("You are not logged in as Admin");
        return;
      }

      const res = await fetch("http://localhost:8081/api/admin/create-officer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(officerData),
      });

      if (!res.ok) {
        let errorMsg;
        const contentType = res.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          errorMsg = data.message || JSON.stringify(data);
        } else {
          errorMsg = await res.text();
        }

        throw new Error(errorMsg || "Failed to create officer");
      }

      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = (await res.json()).message || "Officer account created successfully!";
      } else {
        data = await res.text();
      }

      toast.success(data);

      setOfficerData({
        name: "",
        email: "",
        password: "",
        phoneNo: "",
        department: "",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Admin authorization failed or server error");
    }
  };

  return (
    <Box sx={{
      width: "100%",
      background: "var(--surface)",
      padding: "3rem",
      borderRadius: "32px",
      border: "1px solid var(--border-soft)",
      boxShadow: "var(--card-shadow)",
      position: "relative",
      overflow: "hidden"
    }}>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <div style={{
          padding: "12px",
          borderRadius: "16px",
          background: "color-mix(in srgb, var(--primary) 10%, transparent)",
          color: "var(--primary)"
        }}>
          <UserPlus size={32} />
        </div>
        <div>
          <Typography variant="h4" fontWeight="800" sx={{ color: "var(--text-primary)", mb: 0.5 }}>
            Add Officer
          </Typography>
          <Typography variant="body2" color="var(--text-muted)" fontWeight="600">
            Create a new department official account
          </Typography>
        </div>
      </Box>

      <Grid container spacing={3} sx={{ mb: 2 }}>
        {[
          { label: "Full Name", name: "name", icon: User, type: "text", xs: 12, md: 6 },
          { label: "Email Address", name: "email", icon: Mail, type: "email", xs: 12, md: 6 },
          { label: "Secure Password", name: "password", icon: Lock, type: "password", xs: 12, md: 6 },
          { label: "Phone Number", name: "phoneNo", icon: Phone, type: "tel", xs: 12, md: 6 },
          { label: "Department Name", name: "department", icon: Building2, type: "text", xs: 12 },
        ].map((field) => (
          <Grid item xs={field.xs} md={field.md} key={field.name}>
            <TextField
              key={field.name}
              fullWidth
              label={field.label}
              name={field.name}
              type={field.type}
              variant="outlined"
              value={officerData[field.name]}
              onChange={handleChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  color: "var(--text-primary)",
                  "& fieldset": { borderColor: "var(--border)" },
                  "&:hover fieldset": { borderColor: "var(--primary)" },
                },
                "& .MuiInputLabel-root": { color: "var(--text-muted)" },
                "& .MuiInputLabel-root.Mui-focused": { color: "var(--primary)" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <field.icon size={20} color="var(--text-muted)" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        ))}
      </Grid>

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleSubmit}
        sx={{
          mt: 2,
          py: 1.8,
          borderRadius: "16px",
          textTransform: "none",
          fontSize: "1.1rem",
          fontWeight: "700",
          background: "linear-gradient(135deg, var(--primary), var(--primary-strong))",
          color: "#fff",
          boxShadow: "0 15px 30px color-mix(in srgb, var(--primary) 25%, transparent)",
          "&:hover": {
            boxShadow: "0 20px 40px color-mix(in srgb, var(--primary) 30%, transparent)",
            transform: "translateY(-1px)"
          }
        }}
      >
        Generate Officer Account
      </Button>
    </Box>
  );
};

export default AdminCreateOfficer;
