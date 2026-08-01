import { useState } from "react";
import developerPhoto from "../assets/developer-photo.png";
import { LinkedInIcon } from "./Footer";

let hasShownDemoModal = false;

export function DemoModal() {
  const [open, setOpen] = useState(() => {
    if (hasShownDemoModal) return false;
    hasShownDemoModal = true;
    return true;
  });

  if (!open) return null;

  return (
    <div className="demo-modal-overlay" onClick={() => setOpen(false)}>
      <div className="demo-modal" onClick={(e) => e.stopPropagation()}>
        <button className="demo-modal__close" onClick={() => setOpen(false)} aria-label="Close">
          ✕
        </button>

        <div className="demo-modal__icon">⚠️</div>
        <h2 className="demo-modal__title">Demo Project</h2>
        <p className="demo-modal__text">
          This is a personal demo project, not a real medical service. It is not affiliated with
          any hospital or clinic. All patient, doctor, and medical data shown here is fictitious.
          Please do not use this for real health decisions.
        </p>

        <div className="demo-modal__divider" />

        <div className="demo-modal__profile">
          <img src={developerPhoto} alt="Deepak Kumar" className="demo-modal__profile-photo" />
          <div>
            <div className="demo-modal__profile-name">Deepak Kumar</div>
            <div className="demo-modal__profile-title">Senior AI Engineer</div>
            <div className="demo-modal__profile-sub">Agentic AI &amp; Generative AI Systems</div>
          </div>
        </div>

        <div className="demo-modal__links">
          <a href="mailto:deepak13124012@gmail.com">✉️ deepak13124012@gmail.com</a>
          <a
            href="https://www.linkedin.com/in/deepak-kumar-102624b0/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedInIcon /> https://www.linkedin.com/in/deepak-kumar-102624b0/
          </a>
          <a
            href="/deepak-kumar-resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="demo-modal__resume-link"
          >
            📄 View My Resume ↗
          </a>
        </div>

        <button className="demo-modal__continue-btn" onClick={() => setOpen(false)}>
          Continue to Website →
        </button>
      </div>
    </div>
  );
}
