import { Link } from "react-router-dom";
import developerPhoto from "../assets/developer-photo.png";

const QUICK_LINKS = [
  { icon: "👤", label: "For Patients", to: "/login/patient" },
  { icon: "🩺", label: "For Doctors", to: "/login/doctor" },
  { icon: "🏢", label: "Departments", to: "#" },
  { icon: "📦", label: "Health Packages", to: "#" },
  { icon: "ℹ️", label: "About Us", to: "#" },
  { icon: "📞", label: "Contact Us", to: "#" },
];

const FEATURE_LINKS = [
  { icon: "📷", label: "AI Report Analysis" },
  { icon: "💊", label: "Medication Check" },
  { icon: "🛡️", label: "Risk Assessment" },
  { icon: "📁", label: "Health Records" },
  { icon: "🌐", label: "Multi-language Support" },
  { icon: "📅", label: "Appointment Booking" },
];

const TRUST_BADGES = [
  { icon: "✅", label: "Secure & Private" },
  { icon: "🔒", label: "HIPAA Compliant" },
  { icon: "🛡️", label: "Trusted by Doctors" },
  { icon: "👥", label: "25,000+ Patients" },
];

const TECH_STACK = ["React", "FastAPI", "LangGraph", "PostgreSQL", "Docker", "GCP"];

export function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.14 1.45-2.14 2.94v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.11 20.45H3.56V9h3.55v11.45z" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <div className="site-footer__brand">
            <span className="site-footer__brand-icon">➕</span>
            <div>
              <div className="site-footer__brand-name">Sanjeevani</div>
              <div className="site-footer__brand-sub">Multi-Speciality Hospital</div>
            </div>
          </div>
          <p className="site-footer__desc">
            AI-powered healthcare platform helping patients and doctors with intelligent
            insights, report analysis, risk assessment and better clinical decisions.
          </p>
          <div className="site-footer__badges">
            {TRUST_BADGES.map((b) => (
              <div className="site-footer__badge" key={b.label}>
                <span className="site-footer__badge-icon">{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul className="site-footer__list">
            {QUICK_LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to}>
                  <span>{l.icon}</span> {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Features</h4>
          <ul className="site-footer__list">
            {FEATURE_LINKS.map((f) => (
              <li key={f.label}>
                <Link to="#">
                  <span>{f.icon}</span> {f.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Developed by</h4>
          <div className="site-footer__dev">
            <div
              className="site-footer__dev-photo"
              style={{ backgroundImage: `url(${developerPhoto})` }}
              role="img"
              aria-label="Deepak Kumar"
              onContextMenu={(e) => e.preventDefault()}
            />
            <div>
              <div className="site-footer__dev-name">Deepak Kumar</div>
              <div className="site-footer__dev-title">Senior AI Engineer</div>
              <div className="site-footer__dev-sub">Agentic AI &amp; Generative AI Systems</div>
            </div>
          </div>
          <div className="site-footer__dev-contact">
            <a href="mailto:deepak13124012@gmail.com">✉️ deepak13124012@gmail.com</a>
            <a
              href="https://www.linkedin.com/in/deepak-kumar-102624b0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedInIcon /> linkedin.com/in/deepak-kumar-102624b0
            </a>
            <a href="/deepak-kumar-resume.pdf" target="_blank" rel="noopener noreferrer">
              📄 Resume
            </a>
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="site-footer__copyright">
          <strong>© {year} Deepak Kumar. All Rights Reserved.</strong>
          <p>
            This platform is for informational purposes only and not a substitute for
            professional medical advice, diagnosis or treatment.
          </p>
        </div>
        <div className="site-footer__tech">
          <span>🏅 Built with ❤️ using</span>
          <span className="site-footer__tech-list">{TECH_STACK.join(" • ")}</span>
        </div>
        <div className="site-footer__legal">
          <Link to="#">Privacy Policy</Link> · <Link to="#">Terms of Use</Link> ·{" "}
          <Link to="#">Contact Support</Link>
        </div>
      </div>
    </footer>
  );
}
