import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Camera,
  LogOut,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { handleLogout } from "./Sidebar";

// ── VIEW MODE ─────────────────────────────────────────────
const ViewMode = ({ userData, setIsEditing, onLogout }) => {
  const infoItems = [
    { icon: User, label: "Full Name", value: userData.name },
    { icon: Mail, label: "Email", value: userData.email },
    { icon: Phone, label: "Phone", value: userData.phone },
    { icon: MapPin, label: "Location", value: userData.location },
    { icon: Calendar, label: "Age", value: userData.age },
  ];

  return (
    <>
      <div style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}>
        {infoItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: 12 }}>
              <Icon size={18} />
              <strong>{item.label}:</strong> {item.value || "—"}
            </div>
          );
        })}
      </div>

      <button onClick={() => setIsEditing(true)}>Edit Profile</button>
      <button onClick={onLogout}>Logout</button>
    </>
  );
};

// ── EDIT MODE ─────────────────────────────────────────────
const EditMode = ({ editData, setEditData, handleSave, saving, setIsEditing, errors }) => {
  const fields = [
    { id: "name", label: "Name", type: "text" },
    { id: "phone", label: "Phone", type: "text" },
    { id: "location", label: "Location", type: "text" },
    { id: "age", label: "Age", type: "number" },
  ];

  return (
    <>
      {fields.map((f) => (
        <div key={f.id}>
          <label>{f.label}</label>
          <input
            type={f.type}
            value={editData?.[f.id] || ""}
            onChange={(e) =>
              setEditData({ ...editData, [f.id]: e.target.value })
            }
          />
          {errors[f.id] && <p style={{ color: "red" }}>{errors[f.id]}</p>}
        </div>
      ))}

      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </button>

      <button onClick={() => setIsEditing(false)}>Cancel</button>
    </>
  );
};

// ── MAIN PROFILE ───────────────────────────────────────────
const Profile = () => {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    age: "",
  });

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    age: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // ── FETCH PROFILE ─────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const res = await api.get("/api/citizen/profile");

        // 🔥 SAFE MAPPING (handles both direct & wrapped response)
        const data = res.data?.data || res.data;

        const mapped = {
          name: data?.name || "",
          email: data?.email || "",
          phone: data?.phoneNo || "",
          location: data?.address || "",
          age: data?.age || "",
        };

        setUserData(mapped);
        setEditData(mapped);
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ── SYNC EDIT DATA WHEN USER DATA CHANGES ─────────────
  useEffect(() => {
    setEditData(userData);
  }, [userData]);

  // ── VALIDATION ─────────────────────────────
  const validate = () => {
    const err = {};

    if (!editData.name || editData.name.length < 2) {
      err.name = "Name too short";
    }

    if (editData.phone && !/^[6-9]\d{9}$/.test(editData.phone)) {
      err.phone = "Invalid phone";
    }

    if (editData.age && (editData.age < 18 || editData.age > 120)) {
      err.age = "Invalid age";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ── SAVE PROFILE ─────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      const res = await api.put("/api/citizen/profile", {
        name: editData.name,
        phoneNo: editData.phone,
        address: editData.location,
        age: Number(editData.age),
      });

      const updated = res.data?.data || res.data;

      const mapped = {
        name: updated?.name,
        email: updated?.email,
        phone: updated?.phoneNo,
        location: updated?.address,
        age: updated?.age,
      };

      setUserData(mapped);
      setIsEditing(false);

      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const onLogout = () => handleLogout(navigate);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div>
        <h2>{userData.name}</h2>
        <p>{userData.email}</p>
      </div>

      {isEditing ? (
        <EditMode
          editData={editData}
          setEditData={setEditData}
          handleSave={handleSave}
          saving={saving}
          setIsEditing={setIsEditing}
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
  );
};

export default Profile;
