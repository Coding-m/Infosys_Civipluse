import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera, LogOut } from "lucide-react";
import { toast } from "react-toastify"; // ✅ Use react-toastify instead of custom toast
import { useNavigate } from "react-router-dom"; // ✅ Use hook instead of prop
import api from "../../../api/axios";
import { handleLogout } from "./Sidebar"; // ✅ Use shared logout helper

// ── View Mode ─────────────────────────────────────────────────────────────────
const ViewMode = ({ userData, setIsEditing, onLogout }) => {
  const infoItems = [
    { icon: User,     label: "Full Name",     value: userData.name,     color: "primary" },
    { icon: Mail,     label: "Email Address", value: userData.email,    color: "accent" },
    { icon: Phone,    label: "Phone Number",  value: userData.phone,    color: "green" },
    ...(userData.location ? [{ icon: MapPin,    label: "Location",  value: userData.location, color: "amber" }] : []),
    ...(userData.age      ? [{ icon: Calendar,  label: "Age",       value: `${userData.age} years`, color: "purple" }] : []),
  ];

  const colorMap = {
    primary: { bg: "linear-gradient(135deg, var(--primary), var(--primary-strong))", light: "color-mix(in srgb, var(--primary) 3%, transparent)", icon: "white" },
    accent:  { bg: "color-mix(in srgb, var(--accent) 20%, transparent)",             light: "color-mix(in srgb, var(--accent) 3%, transparent)",   icon: "var(--accent)" },
    green:   { bg: "rgba(16,185,129,0.15)",  light: "color-mix(in srgb, #10b981 3%, transparent)", icon: "#10b981" },
    amber:   { bg: "rgba(245,158,11,0.15)",  light: "color-mix(in srgb, #f59e0b 3%, transparent)", icon: "#f59e0b" },
    purple:  { bg: "rgba(139,92,246,0.15)",  light: "color-mix(in srgb, #8b5cf6 3%, transparent)", icon: "#8b5cf6" },
  };

  return (
    <>
      <div style={{ display: "grid", gap: "1.5rem", marginBottom: "2rem" }}>
        {infoItems.map((item) => {
          const Icon   = item.icon;
          const colors = colorMap[item.color];
          return (
            <div key={item.label} style={{ background: colors.light, borderRadius: "16px", padding: "1.25rem", border: "1px solid var(--border-soft)", display: "grid", gridTemplateColumns: "auto 1fr", gap: "1rem", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "12px", background: colors.bg }}>
                <Icon size={20} color={colors.icon} />
              </div>
              <div>
                <p style={{ margin: "0 0 0.25rem", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: "600", color: "var(--text-primary)" }}>{item.value || "—"}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <button type="button" onClick={() => setIsEditing(true)} style={{ padding: "1rem", background: "linear-gradient(135deg, var(--primary), var(--primary-strong))", color: "white", border: "none", borderRadius: "14px", fontSize: "1rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontFamily: "inherit" }}>
          <Edit2 size={20} /> Edit Profile
        </button>
        <button type="button" onClick={onLogout} style={{ padding: "1rem", background: "transparent", color: "var(--accent)", border: "1.5px solid var(--accent)", borderRadius: "14px", fontSize: "1rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontFamily: "inherit" }}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </>
  );
};

// ── Edit Mode ─────────────────────────────────────────────────────────────────
const EditMode = ({ editData, setEditData, handleSave, saving, setIsEditing, userData, errors }) => {
  const inputFields = [
    { id: "name",     label: "Full Name",          type: "text",  value: editData.name        || "" },
    { id: "email",    label: "Email Address",       type: "email", value: editData.email       || "", disabled: true, readOnly: true, placeholder: "Email cannot be changed" },
    { id: "phone",    label: "Phone Number",        type: "tel",   value: editData.phone       || "", placeholder: "10 digits only" },
    { id: "location", label: "Location (Optional)", type: "text",  value: editData.location    || "", placeholder: "Your city/region" },
    { id: "age",      label: "Age",                 type: "number", value: editData.age        || "", placeholder: "Your age" },
  ];

  return (
    <>
      <div style={{ display: "grid", gap: "1.5rem", marginBottom: "2rem" }}>
        {inputFields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>
              {field.label}
            </label>
            <input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={field.value}
              disabled={field.disabled}
              readOnly={field.readOnly}
              onChange={(e) => setEditData({ ...editData, [field.id]: e.target.value })}
              style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "14px", border: `1px solid ${errors[field.id] ? "var(--accent)" : "var(--border)"}`, background: field.disabled ? "color-mix(in srgb, var(--border) 20%, transparent)" : "color-mix(in srgb, var(--surface) 95%, transparent)", color: "var(--text-primary)", fontSize: "1rem", fontFamily: "inherit", boxSizing: "border-box", cursor: field.disabled ? "not-allowed" : "text" }}
            />
            {errors[field.id] && (
              <p style={{ margin: "0.5rem 0 0", color: "var(--accent)", fontSize: "0.8rem" }}>{errors[field.id]}</p>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <button type="button" onClick={handleSave} disabled={saving} style={{ padding: "1rem", background: saving ? "var(--text-muted)" : "linear-gradient(135deg, var(--primary), var(--primary-strong))", color: "white", border: "none", borderRadius: "14px", fontSize: "1rem", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontFamily: "inherit", opacity: saving ? 0.7 : 1 }}>
          {saving ? <><span className="spinner" /> Saving...</> : <><Save size={20} /> Save Changes</>}
        </button>

        <button type="button" onClick={() => { setIsEditing(false); setEditData(userData); }} disabled={saving} style={{ padding: "1rem", background: "transparent", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "14px", fontSize: "1rem", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontFamily: "inherit", opacity: saving ? 0.5 : 1 }}>
          <X size={20} /> Cancel
        </button>
      </div>
    </>
  );
};

// ── Main Profile ──────────────────────────────────────────────────────────────
const Profile = () => { // ✅ Removed navigate prop — use hook
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [userData, setUserData]   = useState(null);
  const [editData, setEditData]   = useState(null);
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/citizen/profile");
        const mappedData = {
          name:     response.data.name,
          email:    response.data.email,
          phone:    response.data.phoneNo,
          location: response.data.address,
          age:      response.data.age,
        };
        setUserData(mappedData);
        setEditData(mappedData);
      } catch {
        toast.error("Failed to load profile. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!editData.name?.trim() || editData.name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters";
    if (editData.phone && !/^[6-9]\d{9}$/.test(editData.phone))
      newErrors.phone = "Enter a valid 10-digit Indian phone number";
    if (editData.age && (Number(editData.age) < 18 || Number(editData.age) > 120))
      newErrors.age = "Age must be between 18 and 120";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      await api.put("/api/citizen/profile", {
        name:    editData.name?.trim(),
        phoneNo: editData.phone,
        address: editData.location,
        age:     Number(editData.age) || 0,
      });
      setUserData(editData);
      setIsEditing(false);
      setErrors({});
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to save profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const onLogout = () => handleLogout(navigate); // ✅ Shared logout — clears both storages

  if (loading) {
    return (
      <div style={{ background: "var(--surface)", borderRadius: "24px", padding: "3rem", textAlign: "center", border: "1px solid var(--border-soft)" }}>
        <span className="spinner" />
        <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>Loading profile...</p>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div style={{ background: "var(--surface)", borderRadius: "24px", border: "1px solid var(--border-soft)", boxShadow: "var(--card-shadow)", maxWidth: "900px", margin: "0 auto", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-strong))", padding: "3rem 2rem", textAlign: "center", position: "relative" }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", marginBottom: "1.5rem", position: "relative", border: "3px solid rgba(255,255,255,0.3)" }}>
          <User size={50} color="white" />
          <button
            type="button"
            aria-label="Change profile picture"
            style={{ position: "absolute", bottom: 0, right: 0, background: "var(--accent)", borderRadius: "50%", padding: "0.5rem", border: "3px solid white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}
          >
            <Camera size={16} color="white" />
          </button>
        </div>
        <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.75rem", fontWeight: "700", color: "white" }}>{userData.name}</h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }}>Citizen Account</p>
      </div>

      {/* Content */}
      <div style={{ padding: "2.5rem" }}>
        {isEditing ? (
          <EditMode
            editData={editData}
            setEditData={setEditData}
            handleSave={handleSave}
            saving={saving}
            setIsEditing={setIsEditing}
            userData={userData}
            errors={errors}
          />
        ) : (
          <ViewMode
            userData={userData}
            setIsEditing={setIsEditing}
            onLogout={onLogout}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;