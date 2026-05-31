import { useState } from "react";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logoImg from "../../assets/Logo.jpg";
import { useThemePreference } from "../../hooks/useThemePreference.js";
import { adminSignup } from "../../api/auth.js";

export default function AdminSignup() {
  const { theme, toggleTheme } = useThemePreference();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id.replace("signup-", "")]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error("All fields are required!");
      return;
    }

    try {
      await adminSignup({ name: form.name, email: form.email, password: form.password });
      toast.success("Admin signup successful!");
      navigate("/");
    } catch {
      toast.error("Signup failed! Please try again.");
    }
  };

  return (
    <div className="page">
      <header className="app-header">
        <div className="logo-group">
          <img src={logoImg} alt="CivicPulse Hub logo" />
          <p className="logo-title">CivicPulse Hub</p>
        </div>
        <button type="button" className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? <Sun /> : <Moon />}
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
      </header>

      <main className="register-shell">
        <section className="form-panel">
          <Link to="/" className="secondary-link">
            <ArrowLeft /> Back to login
          </Link>

          <div>
            <p className="eyebrow">ADMIN SIGN UP</p>
            <h3>Enter Your Details</h3>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="text-field">
              <label htmlFor="signup-name">Full name</label>
              <input id="signup-name" type="text" placeholder="e.g., John Doe" value={form.name} onChange={handleChange} />
            </div>
            <div className="text-field">
              <label htmlFor="signup-email">Email ID</label>
              <input id="signup-email" type="email" placeholder="you@admin.com" value={form.email} onChange={handleChange} />
            </div>
            <div className="text-field">
              <label htmlFor="signup-password">Password</label>
              <input id="signup-password" type="password" placeholder="Create password" value={form.password} onChange={handleChange} />
            </div>
            <button type="submit" className="primary-btn">Sign Up</button>
          </form>
        </section>
      </main>
    </div>
  );
}