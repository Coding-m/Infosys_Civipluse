import { useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Lock,
  Moon,
  Sun,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";

import logoImg from "../../assets/Logo.jpg";
import { useThemePreference } from "../../hooks/useThemePreference.js";
import {
  citizenLogin,
  adminLogin,
  officerLogin,
} from "../../api/auth.js";

const portals = [
  {
    id: "user",
    label: "User Portal",
    idLabel: "User Email",
  },
  {
    id: "admin",
    label: "Admin Portal",
    idLabel: "Admin Email",
  },
  {
    id: "officer",
    label: "Officer Portal",
    idLabel: "Officer Email",
  },
];

const PORTAL_CONFIG = {
  user: {
    login: citizenLogin,
    dashboard: "/user-dashboard",
  },
  admin: {
    login: adminLogin,
    dashboard: "/admin-dashboard",
  },
  officer: {
    login: officerLogin,
    dashboard: "/officer-dashboard",
  },
};

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function LoginPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemePreference();
  const [selectedPortal, setSelectedPortal] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const activePortal = useMemo(
    () => portals.find((portal) => portal.id === selectedPortal),
    [selectedPortal]
  );

  const sliderLeft = useMemo(
    () => `${portals.findIndex((portal) => portal.id === selectedPortal) * 33.3333}%`,
    [selectedPortal]
  );

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();

      if (isLoading) return;

      const trimmedEmail = email.trim();

      if (!trimmedEmail || !password) {
        toast.warn("Please enter email and password.");
        return;
      }

      if (!validateEmail(trimmedEmail)) {
        toast.error("Please enter a valid email.");
        return;
      }

      try {
        setIsLoading(true);

        const config = PORTAL_CONFIG[selectedPortal];
        const response = await config.login({
          email: trimmedEmail,
          password,
        });

        const token = response?.data?.token;
        // ✅ Get role from backend response — not portal id
        const role = response?.data?.role;

        if (!token) {
          throw new Error("Token not received from server.");
        }

        if (!role) {
          throw new Error("Role not received from server.");
        }

        // ✅ Store token and role separately — consistent with ProtectedRoute
        if (rememberMe) {
          localStorage.setItem("token", token);
          localStorage.setItem("role", role);
        } else {
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("role", role);
          // ✅ Also set in localStorage so ProtectedRoute always finds it
          localStorage.setItem("token", token);
          localStorage.setItem("role", role);
        }

        toast.success(`${activePortal?.label} Login successful!`);
        navigate(config.dashboard, { replace: true });

      } catch (error) {
        console.error("Login Error:", error);

        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Invalid credentials.";

        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [
      email,
      password,
      selectedPortal,
      rememberMe,
      navigate,
      activePortal,
      isLoading,
    ]
  );

  return (
    <div className="page">
      <header className="app-header">
        <div className="logo-group">
          <img src={logoImg} alt="CivicPulse Hub logo" />
          <p className="logo-title">CivicPulse</p>
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

      <main className="auth-shell">
        <section className="intro-content">
          <p className="eyebrow">CivicPulse Hub</p>
          <h2>CivicPulse Hub</h2>
          <h3 className="intro-subtitle">
            Unified Smart City Feedback & Redressal System
          </h3>
          <p>
            Resolve civic issues faster by aligning citizens, officers, and
            administrators through a single collaborative platform.
          </p>
        </section>

        <section className="form-panel">
          <div className="form-panel__header">
            <div>
              <p className="eyebrow">Login Portal</p>
              <h3>{activePortal?.label}</h3>
            </div>
          </div>

          <div className="portal-toggle">
            <span
              className="portal-toggle__slider"
              style={{ left: sliderLeft }}
            />
            {portals.map((portal) => (
              <button
                key={portal.id}
                type="button"
                onClick={() => {
                  setSelectedPortal(portal.id);
                  setEmail("");
                  setPassword("");
                }}
                className={`portal-toggle__button ${
                  selectedPortal === portal.id ? "is-active" : ""
                }`}
              >
                <User size={16} />
                {portal.label}
              </button>
            ))}
          </div>

          <form className="portal-form" onSubmit={handleLogin}>
            <div className="text-field">
              <label htmlFor="portal-email">
                {activePortal?.idLabel}
              </label>
              <div className="input-with-icon">
                <User size={18} />
                <input
                  id="portal-email"
                  type="email"
                  autoComplete="email"
                  maxLength={100}
                  placeholder={`Enter your ${activePortal?.idLabel.toLowerCase()}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trimStart())}
                  required
                />
              </div>
            </div>

            <div className="text-field">
              <label htmlFor="portal-password">Password</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input
                  id="portal-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="remember-me-row">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="primary-btn"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" />
                    Logging in...
                  </>
                ) : (
                  `Continue to ${activePortal?.label}`
                )}
              </button>

              {selectedPortal !== "officer" ? (
                <div className="links-row">
                  <Link
                    to={selectedPortal === "user" ? "/register" : "/adminsignup"}
                    className="secondary-link"
                  >
                    New Account? Sign Up
                  </Link>
                  <Link
                    to={`/forgot-password/${selectedPortal}`}
                    className="secondary-link forgot-password-link"
                  >
                    Forgot Password?
                  </Link>
                </div>
              ) : (
                <p className="inline-note">
                  Officers are added by administrators only. Please contact
                  your system administrator.
                </p>
              )}
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}