import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, User, Lock } from "lucide-react";
import { toast } from "react-toastify";
import {
  citizenForgotPassword, adminForgotPassword,
  citizenResetPassword,  adminResetPassword,
} from "../../api/auth";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const { role }   = useParams();
  const navigate   = useNavigate();

  const [step, setStep]               = useState(1);
  const [email, setEmail]             = useState("");
  const [resetToken, setResetToken]   = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading]         = useState(false);

  // ✅ Validate role from URL — prevent invalid roles
  const isValidRole = role === "admin" || role === "user";
  if (!isValidRole) {
    return (
      <div className="page auth-page">
        <main className="auth-shell">
          <section className="form-panel">
            <h2>Invalid Role</h2>
            <Link to="/" className="secondary-link">Back to Login</Link>
          </section>
        </main>
      </div>
    );
  }

  // ── Step 1 — Request OTP ──────────────────────────────────────────────
  const handleRequestOTP = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    // ✅ Validate email format
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = role === "admin"
        ? await adminForgotPassword({ email: email.trim() })
        : await citizenForgotPassword({ email: email.trim() });

      // ✅ Use toast instead of setMessage — consistent UX
      toast.info(res?.data || res?.data?.message || "OTP sent to your email");
      setStep(2);

    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 — Reset Password ───────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetToken.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    // ✅ Validate password length
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = role === "admin"
        ? await adminResetPassword({ email, resetToken: resetToken.trim(), newPassword })
        : await citizenResetPassword({ email, resetToken: resetToken.trim(), newPassword });

      toast.success(res?.data || res?.data?.message || "Password reset successful!");

      // ✅ Clear sensitive data before navigating
      setResetToken("");
      setNewPassword("");
      navigate("/", { replace: true }); // ✅ replace — can't go back to reset page

    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <main className="auth-shell">
        <section className="form-panel">
          {/* ✅ Capitalize role for display */}
          <h2>Forgot Password ({role.charAt(0).toUpperCase() + role.slice(1)})</h2>

          {step === 1 && (
            <>
              <p>Enter your registered email to receive an OTP</p>
              <form className="portal-form" onSubmit={handleRequestOTP}>
                <div className="text-field">
                  <label htmlFor="fp-email">Email</label>
                  <div className="input-with-icon">
                    <User size={18} />
                    <input
                      id="fp-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.trimStart())}
                      autoComplete="email"
                      maxLength={100}
                      required
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={loading}
                    aria-busy={loading}
                  >
                    {loading ? "Sending OTP..." : "Send OTP"} <ArrowRight size={18} />
                  </button>
                  <Link to="/" className="secondary-link">Back to Login</Link>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <p>Enter the OTP sent to <strong>{email}</strong></p>
              <form className="portal-form" onSubmit={handleResetPassword}>
                <div className="text-field">
                  <label htmlFor="fp-otp">OTP</label>
                  <input
                    id="fp-otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value.trim())}
                    maxLength={6}
                    required
                  />
                </div>

                <div className="text-field">
                  <label htmlFor="fp-password">New Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <input
                      id="fp-password"
                      type="password"
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={loading}
                    aria-busy={loading}
                  >
                    {loading ? "Resetting..." : "Reset Password"} <ArrowRight size={18} />
                  </button>

                  {/* ✅ Allow going back to re-enter email */}
                  <button
                    type="button"
                    className="secondary-link"
                    onClick={() => setStep(1)}
                  >
                    Wrong email? Go back
                  </button>

                  <Link to="/" className="secondary-link">Back to Login</Link>
                </div>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  );
}