import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const NAV_LINKS = [
  { label: "Home", to: "/", coded: true },
  { label: "For Patients", to: "/login/patient", coded: true },
  { label: "For Doctors", to: "/login/doctor", coded: true },
  { label: "Departments", to: "#", coded: false },
  { label: "About Us", to: "#", coded: false },
  { label: "Contact Us", to: "#", coded: false },
];

function BrandLogo() {
  return (
    <svg className="navbar__logo" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="36" height="36" rx="10" fill="var(--brand-light)" stroke="var(--brand)" strokeWidth="2" />
      <path d="M20 11v18M11 20h18" stroke="var(--brand)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Navbar({ active }: { active?: string }) {
  const { token, role, fullName, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        <BrandLogo />
        <span className="navbar__brand-text">
          <span className="navbar__brand-name">Sanjeevani</span>
          <span className="navbar__brand-sub">Multi-Speciality Hospital</span>
        </span>
      </Link>

      <div className="navbar__links">
        {NAV_LINKS.map((link) => (
          <Link key={link.label} to={link.to} className={active === link.label ? "active" : ""}>
            {link.label}
          </Link>
        ))}
      </div>

      <div className="navbar__actions">
        <Link to="#" className="btn-primary">
          📅 Book Appointment
        </Link>
        {token && (
          <>
            <Link to="#" className="navbar__icon-btn" title="Notifications (not wired up)">
              🔔
              <span className="navbar__badge">3</span>
            </Link>
            <button className="navbar__avatar" onClick={logout} title={`Log out (${fullName}, ${role})`}>
              {(fullName || "?").slice(0, 2).toUpperCase()}
            </button>
          </>
        )}
        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="navbar__mobile-menu">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={active === link.label ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {token && (
            <button
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
            >
              🚪 Log out ({fullName})
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
