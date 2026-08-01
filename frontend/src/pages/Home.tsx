import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { DemoModal } from "../components/DemoModal";
import heroPhoto from "../assets/hero-photo.png";

const FEATURES = [
  { icon: "📄", color: "#2563eb", label: "Understand Reports", text: "Get simple explanations of blood tests, X-rays and medical reports." },
  { icon: "💊", color: "#16a34a", label: "Medication Analysis", text: "Check for side effects, interactions and proper dosage information." },
  { icon: "❤️", color: "#7c3aed", label: "Risk Prediction", text: "AI predicts potential health risks and suggests early precautions." },
  { icon: "📖", color: "#d97706", label: "Disease Explanation", text: "Learn about conditions, symptoms, causes and treatments." },
  { icon: "🌐", color: "#2563eb", label: "Multi-Language Support", text: "Health information in English, Hindi, Punjabi, Tamil and more." },
];

const STATS = [
  { icon: "👥", value: "25,000+", label: "Patients Helped" },
  { icon: "📄", value: "50,000+", label: "Reports Analyzed" },
  { icon: "🛡️", value: "100%", label: "Secure & Private" },
  { icon: "⭐", value: "4.8/5", label: "Patient Rating" },
  { icon: "🏥", value: "Trusted", label: "by Doctors Across Specialties" },
];

export function Home() {
  return (
    <div>
      <DemoModal />
      <Navbar active="Home" />

      <section className="home-hero">
        <div>
          <span className="home-hero__badge">✨ AI-Powered | Safe | Trusted | Multilingual</span>
          <h1>
            Your Health, Explained
            <br />
            Clearly <span className="accent">with AI</span>
          </h1>
          <p>
            Our Medical AI Assistant helps patients understand reports, medications and health
            risks in simple language.
          </p>
          <div className="home-hero__actions">
            <Link to="/login/patient" className="btn-primary">
              💬 Try AI Assistant Now
            </Link>
            <Link to="#" className="btn-secondary">
              📄 Upload Report
            </Link>
          </div>
          <div className="home-hero__langs">
            <span>Available in:</span>
            <Link to="#">English</Link>
            <Link to="#">हिंदी</Link>
            <Link to="#">ਪੰਜਾਬੀ</Link>
            <Link to="#">தமிழ்</Link>
          </div>
        </div>

        <div className="home-hero__visual">
          <img
            src={heroPhoto}
            alt="A doctor showing a patient her health report on a tablet"
            className="home-hero__visual-img"
          />

          <div className="floating-card floating-card--1">
            <div className="floating-card__title">📷 AI Report Analysis</div>
            <div>
              Blood Report <span className="badge badge--normal">Normal</span>
            </div>
            <Link to="#" className="floating-card__link">
              Show details →
            </Link>
          </div>

          <div className="floating-card floating-card--2">
            <div className="floating-card__title">💊 Medication Check</div>
            <div style={{ color: "var(--warning)" }}>2 Interactions Found</div>
            <Link to="#" className="floating-card__link">
              Review Now →
            </Link>
          </div>

          <div className="floating-card floating-card--3">
            <div className="floating-card__title">🛡️ Risk Assessment</div>
            <div style={{ color: "var(--success)" }}>Low Risk</div>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Keep it up!</span>
          </div>

          <div className="floating-card--shield">
            🔒
            <span>Secure &amp; HIPAA Compliant</span>
          </div>
        </div>
      </section>

      <section className="home-section">
        <h2>How Our Medical AI Assistant Helps</h2>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.label}>
              <div className="feature-card__icon" style={{ background: `${f.color}1a`, color: f.color }}>
                {f.icon}
              </div>
              <h3>{f.label}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="stats-bar">
        {STATS.map((s) => (
          <div className="stats-bar__stat" key={s.label}>
            <strong>
              {s.icon} {s.value}
            </strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
