import React, { useState, useEffect } from "react";
//import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera, LogOut } from "lucide-react"; 
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    Grid,
    InputAdornment,
} from "@mui/material";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  ShieldCheck,
  Camera,
  Calendar,
  MapPin
} from "lucide-react";

import api from "../../../api/axios";  
import { useNavigate } from "react-router-dom"; 
import { toast } from "react-toastify";


// View Mode Component
const Profile = () => 
 {
    // Mock data - in a real app, this would come from a global state or API 
    //Updated const function 
    const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    location: "",
    avatar: "",
});


    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUser((prev) => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success("Profile details updated successfully!");
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h4" fontWeight="800" sx={{ mb: 4, color: "var(--text-primary)" }}>
                Account Settings
            </Typography>

            <div style={{
                background: "var(--surface)",
                borderRadius: "32px",
                border: "1px solid var(--border-soft)",
                boxShadow: "var(--card-shadow)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
            }}>

                <div style={{ padding: "3rem" }}>
                    <Box display="flex" alignItems="center" gap={3} mb={5}>
                        <div style={{ position: "relative" }}>
                            <Avatar
                                src={user.avatar}
                                sx={{
                                    width: 120,
                                    height: 120,
                                    border: "4px solid var(--border-soft)",
                                    boxShadow: "var(--card-shadow)",
                                    bgcolor: "var(--primary)",
                                    fontSize: "2.5rem",
                                    fontWeight: "800"
                                }}
                            >
                                {user.name.charAt(0)}
                            </Avatar>
                            <label htmlFor="avatar-upload" style={{
                                position: "absolute",
                                bottom: "4px",
                                right: "4px",
                                background: "var(--surface)",
                                padding: "8px",
                                borderRadius: "12px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid var(--border-soft)",
                            }}>
                                <Camera size={18} color="var(--primary)" />
                                <input id="avatar-upload" hidden type="file" accept="image/*" onChange={handleAvatarChange} />
                            </label>
                        </div>
                        <div>
                            <Typography variant="h4" fontWeight="800" color="var(--text-primary)" gutterBottom>
                                {user.name}
                            </Typography>
                            <Typography variant="body1" color="var(--text-muted)" fontWeight="600" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <ShieldCheck size={18} /> {user.role}
                                <span style={{ opacity: 0.5 }}>•</span>
                                {user.department}
                            </Typography>
                        </div>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            {[
                                { label: "Full Name", name: "name", icon: User, type: "text" },
                                { label: "Email Address", name: "email", icon: Mail, type: "email" },
                                { label: "Phone Number", name: "phone", icon: Phone, type: "tel" },
                                { label: "Age", name: "age", icon: Calendar, type: "number" },
                                { label: "Gender", name: "gender", icon: User, type: "text" },
                                { label: "Location", name: "location", icon: MapPin, type: "text" },
                            ].map((field) => (
                                <Grid item xs={12} md={6} key={field.name}>
                                    <TextField
                                        fullWidth
                                        label={field.label}
                                        name={field.name}
                                        type={field.type}
                                        value={user[field.name]}
                                        onChange={handleChange}
                                        variant="outlined"
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
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Access Role"
                                    name="role"
                                    value={user.role}
                                    disabled
                                    variant="outlined"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "16px",
                                            color: "var(--text-primary)",
                                            bgcolor: "rgba(0,0,0,0.02)",
                                            "& fieldset": { borderColor: "var(--border-soft)" },
                                        },
                                        "& .MuiInputLabel-root": { color: "var(--text-muted)" },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <ShieldCheck size={20} color="var(--text-muted)" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    helperText="Role and permissions are managed by the System Administrator."
                                />
                            </Grid>
                        </Grid>

                        <Box display="flex" gap={2} mt={5}>
                            <Button
                                variant="contained"
                                size="large"
                                type="submit"
                                sx={{
                                    borderRadius: "16px",
                                    px: 5,
                                    py: 1.8,
                                    textTransform: "none",
                                    fontSize: "1rem",
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
                                Save Changes
                            </Button>
                        </Box>
                    </form>
                </div>
            </div>
        </Box>
    );
};

export default Profile; 