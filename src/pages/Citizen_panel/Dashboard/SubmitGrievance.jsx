import React, { useState } from "react";
import { toast } from "react-toastify";
import { Upload, MapPin, Check } from "lucide-react";
import api from "../../../api/axios.js"; // ✅ Use configured axios instance
import MapSelector from "./MapSelector";

// ✅ Match your backend ComplaintCategory enum exactly
const CATEGORIES = [
  { value: "ELECTRICITY", label: "Electricity" },
  { value: "WATER",       label: "Water" },
  { value: "ROADS",        label: "Roads" },       // ✅ Check your backend enum name
  { value: "SANITATION",  label: "Sanitation" },
  { value: "TRAFFIC",     label: "Traffic" },
  { value: "OTHER",       label: "Other" },
];

const INITIAL_FORM = {
  title: "",
  description: "",
  category: "",
  location: "",
  citizenName: "",
  citizenPhone: "",
};

const SubmitGrievance = ({ setComplaints }) => {
  const [formData, setFormData]     = useState(INITIAL_FORM);
  const [coordinates, setCoordinates] = useState(null);
  const [imageFile, setImageFile]   = useState(null);
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(false);

  // ✅ Image size validation — matches backend 10MB limit
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim())
      newErrors.title = "Title is required";

    if (!formData.category)
      newErrors.category = "Category is required";

    if (!formData.description.trim())
      newErrors.description = "Description is required";

    if (!formData.citizenName.trim())
      newErrors.citizenName = "Name is required";

    if (!/^[6-9]\d{9}$/.test(formData.citizenPhone))
      newErrors.citizenPhone = "Enter a valid 10-digit Indian phone number";

    if (!coordinates)
      newErrors.location = "Please select location on map";

    // ✅ Validate image size
    if (imageFile && imageFile.size > MAX_IMAGE_SIZE)
      newErrors.image = "Image must be less than 10MB";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // ✅ Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // ✅ Optimistic UI — add temp complaint immediately
    const tempComplaint = {
      id: `temp-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      status: "PENDING",
      submissionDate: new Date().toISOString(),
      location: formData.location,
    };

    setComplaints((prev) => [tempComplaint, ...prev]);
    setLoading(true);

    try {
      const fd = new FormData();
      Object.keys(formData).forEach((k) => fd.append(k, formData[k]));
      fd.append("latitude", coordinates.lat);
      fd.append("longitude", coordinates.lng);
      if (imageFile) fd.append("image", imageFile);

      // ✅ Use api instance — no manual token needed
      const { data } = await api.post(
        "/api/citizen/complaints/submit",
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000, // ✅ 60s for image upload — Cloudinary can be slow
        }
      );

      // ✅ Replace temp with real complaint from server
      setComplaints((prev) =>
        prev.map((c) => (c.id === tempComplaint.id ? data : c))
      );

      toast.success(`Grievance submitted! ID: ${data.id}`, { autoClose: 3000 });
      handleCancel();

    } catch (error) {
      // ✅ Remove temp complaint on failure
      setComplaints((prev) =>
        prev.filter((c) => c.id !== tempComplaint.id)
      );

      toast.error(
        error?.response?.data?.message ||
        "Failed to submit grievance. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(INITIAL_FORM);
    setCoordinates(null);
    setImageFile(null);
    setErrors({});
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ Validate image size before setting
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((prev) => ({ ...prev, image: "Image must be less than 10MB" }));
      e.target.value = ""; // ✅ Reset file input
      return;
    }

    setImageFile(file);
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  // Shared input style helper
  const inputStyle = (hasError) => ({
    width: "100%",
    padding: "0.85rem 1rem",
    borderRadius: "14px",
    border: `1px solid ${hasError ? "var(--accent)" : "var(--border)"}`,
    background: "color-mix(in srgb, var(--surface) 95%, transparent)",
    color: "var(--text-primary)",
    fontSize: "1rem",
    fontFamily: "inherit",
    transition: "border 0.2s ease, box-shadow 0.2s ease",
    boxSizing: "border-box",
  });

  return (
    <div style={{
      background: "var(--surface)",
      borderRadius: "24px",
      padding: "2.5rem",
      border: "1px solid var(--border-soft)",
      boxShadow: "var(--card-shadow)",
      maxWidth: 900,
      margin: "0 auto",
    }}>

      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.75rem", fontWeight: "700", color: "var(--text-primary)" }}>
          Submit New Grievance
        </h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Help us improve your community by reporting issues
        </p>
      </div>

      <div style={{ height: "1px", background: "var(--border-soft)", marginBottom: "2rem" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>

        {/* Title */}
        <div>
          <label htmlFor="title" style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            Grievance Title *
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter a brief title for your grievance"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            maxLength={200}
            style={inputStyle(errors.title)}
          />
          {errors.title && <p style={{ margin: "0.5rem 0 0", color: "var(--accent)", fontSize: "0.85rem" }}>{errors.title}</p>}
        </div>

        {/* Category & Location */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
          <div>
            <label htmlFor="category" style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              style={inputStyle(errors.category)}
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && <p style={{ margin: "0.5rem 0 0", color: "var(--accent)", fontSize: "0.85rem" }}>{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="location" style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              📍 Location Name (Optional)
            </label>
            <input
              id="location"
              type="text"
              placeholder="Enter location name..."
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              maxLength={200}
              style={inputStyle(false)}
            />
          </div>
        </div>

        {/* Map */}
        <div>
          <label style={{ display: "flex", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.75rem", alignItems: "center", gap: "0.5rem" }}>
            <MapPin size={18} /> Select Location on Map *
          </label>
          <div style={{
            borderRadius: "16px",
            overflow: "hidden",
            border: `2px solid ${errors.location ? "var(--accent)" : "var(--border-soft)"}`,
          }}>
            <MapSelector onLocationSelect={(latlng) => setCoordinates(latlng)} />
          </div>
          {coordinates && (
            <div style={{ marginTop: "0.75rem", padding: "0.75rem 1rem", background: "color-mix(in srgb, var(--primary) 10%, transparent)", borderRadius: "12px", color: "var(--primary)", fontSize: "0.9rem" }}>
              ✓ Selected: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </div>
          )}
          {errors.location && <p style={{ margin: "0.5rem 0 0", color: "var(--accent)", fontSize: "0.85rem" }}>{errors.location}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            Description *
          </label>
          <textarea
            id="description"
            placeholder="Please provide detailed information about the issue..."
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="5"
            maxLength={1000}
            style={{ ...inputStyle(errors.description), resize: "vertical" }}
          />
          {errors.description && <p style={{ margin: "0.5rem 0 0", color: "var(--accent)", fontSize: "0.85rem" }}>{errors.description}</p>}
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="fileInput" style={{ display: "flex", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.75rem", alignItems: "center", gap: "0.5rem" }}>
            <Upload size={18} /> Upload Image (Optional — max 10MB)
          </label>
          <input
            id="fileInput"
            type="file"
            accept="image/png, image/jpeg, image/jpg" // ✅ Match backend allowed types
            onChange={handleImageChange}
            style={{
              width: "100%",
              padding: "1rem",
              borderRadius: "14px",
              border: `2px dashed ${errors.image ? "var(--accent)" : "var(--border)"}`,
              background: "color-mix(in srgb, var(--surface) 95%, transparent)",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          />
          {imageFile && !errors.image && (
            <p style={{ margin: "0.5rem 0 0", color: "var(--primary)", fontSize: "0.85rem" }}>
              ✓ {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
          {errors.image && <p style={{ margin: "0.5rem 0 0", color: "var(--accent)", fontSize: "0.85rem" }}>{errors.image}</p>}
        </div>

        <div style={{ height: "1px", background: "var(--border-soft)" }} />

        {/* Citizen Info */}
        <div>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1.1rem", fontWeight: "600", color: "var(--text-primary)" }}>
            Your Information
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
            <div>
              <label htmlFor="citizenName" style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                Name *
              </label>
              <input
                id="citizenName"
                type="text"
                placeholder="Your full name"
                name="citizenName"
                value={formData.citizenName}
                onChange={handleInputChange}
                maxLength={100}
                style={inputStyle(errors.citizenName)}
              />
              {errors.citizenName && <p style={{ margin: "0.5rem 0 0", color: "var(--accent)", fontSize: "0.85rem" }}>{errors.citizenName}</p>}
            </div>

            <div>
              <label htmlFor="citizenPhone" style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                Phone Number *
              </label>
              <input
                id="citizenPhone"
                type="tel"
                placeholder="10-digit phone number"
                name="citizenPhone"
                value={formData.citizenPhone}
                onChange={handleInputChange}
                maxLength={10}
                style={inputStyle(errors.citizenPhone)}
              />
              {errors.citizenPhone && <p style={{ margin: "0.5rem 0 0", color: "var(--accent)", fontSize: "0.85rem" }}>{errors.citizenPhone}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "2rem" }}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: "1rem",
            background: loading ? "var(--text-muted)" : "linear-gradient(135deg, var(--primary), var(--primary-strong))",
            color: "white",
            border: "none",
            borderRadius: "14px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            fontFamily: "inherit",
          }}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Submitting...
            </>
          ) : (
            <>
              <Check size={20} />
              Submit Grievance
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          style={{
            padding: "1rem",
            background: "transparent",
            color: "var(--text-primary)",
            border: "1.5px solid var(--border)",
            borderRadius: "14px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            opacity: loading ? 0.5 : 1,
          }}
        >
          Clear Form
        </button>
      </div>
    </div>
  );
};

export default SubmitGrievance;