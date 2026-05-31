import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Moon,
  Sun,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";

import logoImg from "../../assets/Logo.jpg";
import { useThemePreference } from "../../hooks/useThemePreference.js";
import { citizenSignup } from "../../api/auth.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemePreference();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    age: "",
    phoneNo: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [id.replace("signup-", "")]: value,
    }));
  }, []);

  const validateForm = useCallback(() => {
    const { name, address, age, phoneNo, email, password, confirmPassword } = form;

    if (!name.trim()) {
      toast.error("Full name is required.");
      return false;
    }

    if (!address.trim()) {
      toast.error("Address is required.");
      return false;
    }

    if (!age || Number(age) < 18) {
      toast.error("You must be at least 18 years old.");
      return false;
    }

    if (!phoneRegex.test(phoneNo)) {
      toast.error("Enter a valid 10-digit phone number.");
      return false;
    }

    if (!emailRegex.test(email.trim())) {
      toast.error("Enter a valid email address.");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }

    return true;
  }, [form]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isLoading) return;
      if (!validateForm()) return;

      try {
        setIsLoading(true);
        const signupData = {
          name: form.name.trim(),
          address: form.address.trim(),
          age: Number(form.age),
          phoneNo: form.phoneNo.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        };

        const response = await citizenSignup(signupData);
        toast.success("Registration successful!");
        console.log(response.data);

        navigate("/", { replace: true });
      } catch (error) {
        console.error(error);
        const message =
          error?.response?.data?.message ||
          "Registration failed. Please try again.";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [form, isLoading, navigate, validateForm]
  );

  return (
    <div className="page">
      <header className="app-header">
        <div className="logo-group">
          <img src={logoImg} alt="CivicPulse Hub logo" />
          <div>
            <p className="logo-title">CivicPulse Hub</p>
          </div>
        </div>

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </header>

      <main className="register-shell">
        <section className="form-panel">
          <Link to="/" className="secondary-link">
            <ArrowLeft size={18} />
            Back to Login
          </Link>

          <div>
            <p className="eyebrow">SIGN UP</p>
            <h3>Enroll Your Details</h3>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            {/* Personal Details */}
            <fieldset className="field-section">
              <legend>Personal Details</legend>
              <div className="field-row">
                <div className="text-field">
                  <label htmlFor="signup-name">Full Name</label>
                  <input
                    id="signup-name"
                    type="text"
                    placeholder="e.g. Maya Rao"
                    value={form.name}
                    onChange={handleChange}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="text-field">
                  <label htmlFor="signup-address">Address</label>
                  <input
                    id="signup-address"
                    type="text"
                    placeholder="Ward / Street"
                    value={form.address}
                    onChange={handleChange}
                    maxLength={200}
                    required
                  />
                </div>

                <div className="text-field">
                  <label htmlFor="signup-age">Age</label>
                  <input
                    id="signup-age"
                    type="number"
                    placeholder="e.g. 24"
                    value={form.age}
                    onChange={handleChange}
                    min="18"
                    max="120"
                    required
                  />
                </div>
              </div>
            </fieldset>

            {/* Contact Details */}
            <fieldset className="field-section">
              <legend>Contact Details</legend>
              <div className="field-row">
                <div className="text-field">
                  <label htmlFor="signup-phoneNo">Phone Number</label>
                  <div className="phone-input-group">
                    <span className="country-code-static">🇮🇳 +91</span>
                    <input
                      id="signup-phoneNo"
                      type="tel"
                      placeholder="9876543210"
                      value={form.phoneNo}
                      onChange={handleChange}
                      maxLength={10}
                      className="phone-number-input"
                      required
                    />
                  </div>
                </div>

                <div className="text-field">
                  <label htmlFor="signup-email">Email Address</label>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
            </fieldset>

            {/* Login Details */}
            <fieldset className="field-section">
              <legend>Login Details</legend>
              <div className="field-row">
                <div className="text-field">
                  <label htmlFor="signup-password">Password</label>
                  <div className="input-with-icon">
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="text-field">
                  <label htmlFor="signup-confirmPassword">Confirm Password</label>
                  <div className="input-with-icon">
                    <input
                      id="signup-confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={
                        showConfirmPassword ? "Hide Password" : "Show Password"
                      }
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </fieldset>

            <button type="submit" className="primary-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

