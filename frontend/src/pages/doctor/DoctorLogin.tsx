import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginRequest, registerDoctor } from "../../api/auth";
import { useAuth } from "../../auth/AuthContext";
import { Navbar } from "../../components/Navbar";
import { AuthShowcase } from "../../components/AuthShowcase";
import doctorDesk from "../../assets/doctor-desk.svg";

const FEATURES = [
  { icon: "📄", title: "Patient Management", text: "Manage patient records, history and consultations with ease." },
  { icon: "📊", title: "Smart Insights", text: "AI-powered insights to support better clinical decisions." },
  { icon: "🛡️", title: "Secure & Compliant", text: "HIPAA compliant platform to keep your data safe and secure." },
];

export function DoctorLogin() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const resp =
        mode === "login"
          ? await loginRequest(email, password)
          : await registerDoctor(email, password, fullName, specialty, licenseNumber);
      login(resp.access_token, resp.role, resp.public_id, fullName || email);
      navigate("/doctor");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell--fixed">
      <Navbar active="For Doctors" />
      <div className="auth-page-v2">
        <AuthShowcase
          heading1="Welcome Back,"
          heading2="Doctor!"
          description="Access your dashboard, manage patients, review reports and deliver better care with our AI-powered platform."
          features={FEATURES}
          backgroundImage={doctorDesk}
        />

        <div className="auth-card-wrap">
          <div className="auth-card">
            <div className="auth-card__icon-badge">🩺</div>
            <h1>Doctor {mode === "login" ? "Login" : "Registration"}</h1>
            <p className="auth-card__subtitle">Welcome back! Please login to your account</p>

            <form onSubmit={handleSubmit}>
              {mode === "register" && (
                <>
                  <label>
                    Full name
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </label>
                  <label>
                    Specialty
                    <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} required />
                  </label>
                  <label>
                    License number
                    <input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required />
                  </label>
                </>
              )}

              <label>
                Email
                <div className="input-icon-group">
                  <span className="input-icon-group__icon">✉️</span>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </label>

              <label>
                Password
                <div className="input-icon-group">
                  <span className="input-icon-group__icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-icon-group__toggle"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </label>

              {mode === "login" && (
                <Link to="#" className="auth-card__forgot">
                  Forgot Password?
                </Link>
              )}

              {error && <p className="error-text">{error}</p>}

              <button type="submit" className="btn-primary btn-block" disabled={submitting}>
                {mode === "login" ? "Log in" : "Register"} →
              </button>
            </form>

            <div className="auth-divider">or</div>
            <Link to="#" className="btn-secondary btn-block">
              📱 Login with OTP
            </Link>

            <div className="auth-card__footer">
              <div>
                {mode === "login" ? "New doctor? " : "Already have an account? "}
                <button className="link-button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
                  {mode === "login" ? "Register Now" : "Log in"}
                </button>
              </div>
              <Link to="/login/patient">Patient login</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-stats-bar">
        <div className="auth-stats-bar__item">
          🛡️
          <div>
            <strong>100% Secure</strong>
            <span>Your data is safe with us</span>
          </div>
        </div>
        <div className="auth-stats-bar__item">
          🔒
          <div>
            <strong>HIPAA Compliant</strong>
            <span>We protect your privacy</span>
          </div>
        </div>
        <div className="auth-stats-bar__item">
          👥
          <div>
            <strong>Trusted by 25,000+</strong>
            <span>Doctors across India</span>
          </div>
        </div>
      </div>
    </div>
  );
}
