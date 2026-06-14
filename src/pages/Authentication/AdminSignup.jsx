import { useState } from "react";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logoImg from "../../assets/Logo.jpg";
import { useThemePreference } from "../../hooks/useThemePreference.js";
import { adminSignup } from "../../api/auth.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminSignup() {
  const { theme, toggleTheme } = useThemePreference();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

 
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.id.replace("signup-", "")]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    // ✅ Validate all fields
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error("All fields are required!");
      return;
    }

    if (!emailRegex.test(form.email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsLoading(true);
      await adminSignup({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      toast.success("Admin signup successful!");
      navigate("/", { replace: true });

    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Signup failed! Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="app-header">
        <div className="logo-group">
          <img src={logoImg} alt="CivicPulse Hub logo" />
          <p className="logo-title">CivicPulse Hub</p>
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
      </header>

      <main className="register-shell">
        <section className="form-panel">
          <Link to="/" className="secondary-link">
            <ArrowLeft size={18} /> Back to login
          </Link>

          <div>
            <p className="eyebrow">ADMIN SIGN UP</p>
            <h3>Enter Your Details</h3>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="text-field">
              <label htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                type="text"
                placeholder="e.g., John Doe"
                value={form.name}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </div>

            <div className="text-field">
              <label htmlFor="signup-email">Email ID</label>
              <input
                id="signup-email"
                type="email"
                placeholder="you@admin.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                maxLength={100}
                required
              />
            </div>

            <div className="text-field">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="primary-btn"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
