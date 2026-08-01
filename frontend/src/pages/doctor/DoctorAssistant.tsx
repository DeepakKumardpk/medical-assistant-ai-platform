import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createChat, getChat, postMessage } from "../../api/chats";
import type { ChatDetail } from "../../api/types";
import { Navbar } from "../../components/Navbar";
import { ChatWindow } from "../../components/ChatWindow";
import { useAuth } from "../../auth/AuthContext";

const QUICK_PROMPTS = [
  "Summarize this patient's latest report",
  "Check for drug interactions",
  "Suggest follow-up tests",
  "Explain this in simple terms for the patient",
];

export function DoctorAssistant() {
  const { chatId } = useParams<{ chatId: string }>();
  const [chat, setChat] = useState<ChatDetail | null>(null);
  const { fullName, publicId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!chatId) {
      createChat().then((c) => navigate(`/doctor/chat/${c.id}`, { replace: true }));
      return;
    }
    getChat(chatId).then(setChat);
  }, [chatId]);

  async function refresh() {
    if (chatId) setChat(await getChat(chatId));
  }

  async function handleSend(content: string, language: string) {
    await postMessage(chatId!, content, language);
    await refresh();
  }

  return (
    <div className="app-shell--fixed">
      <Navbar active="For Doctors" />
      <div className="assistant-layout">
        <aside className="side-panel">
          <div className="profile-card">
            <div className="profile-card__avatar">{(fullName || "DR").slice(0, 2).toUpperCase()}</div>
            <div>
              <div className="profile-card__name">Dr. {fullName}</div>
              <div className="profile-card__meta">{publicId}</div>
              <div className="profile-card__meta">
                <span className="status-dot" /> Online
              </div>
            </div>
          </div>

          <h3 style={{ marginTop: 4 }}>Doctor Dashboard</h3>
          <Link to="#" className="side-nav-item">
            🏠 Dashboard
          </Link>
          <button className="side-nav-item active" onClick={() => navigate("/doctor")}>
            🤖 AI Assistant
          </button>
          <Link to="#" className="side-nav-item">
            👥 My Patients
          </Link>
          <Link to="#" className="side-nav-item">
            📅 Appointments
          </Link>
          <Link to="#" className="side-nav-item">
            📁 Reports &amp; Documents
          </Link>
          <Link to="#" className="side-nav-item">
            💊 Prescriptions
          </Link>
          <Link to="#" className="side-nav-item">
            🔁 Follow-ups
          </Link>
          <Link to="#" className="side-nav-item">
            📊 Analytics
          </Link>
          <Link to="#" className="side-nav-item">
            📚 Medical Resources
          </Link>

          <h3>Admin</h3>
          <Link to="#" className="side-nav-item">
            ⚙️ Settings
          </Link>
          <Link to="#" className="side-nav-item">
            🆘 Help &amp; Support
          </Link>

          <div className="side-panel__footer">
            <div style={{ fontSize: 13, fontWeight: 600 }}>AI Co-Pilot for Doctors</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 8px" }}>
              Get AI-powered insights, report summaries and clinical support.
            </div>
            <Link to="#" style={{ display: "block", textAlign: "center", padding: "8px", border: "1px solid var(--border)", borderRadius: 8, textDecoration: "none", fontSize: 13 }}>
              Learn More →
            </Link>
          </div>
        </aside>

        <main className="assistant-main">
          <div className="assistant-main__header">
            <div className="assistant-main__title">
              <div className="assistant-main__title-icon">🤖</div>
              <div>
                <h2>AI Clinical Assistant</h2>
                <div className="assistant-main__online">
                  <span className="status-dot" /> Online
                </div>
              </div>
            </div>
            <Link to="/doctor/approvals" className="side-nav-item" style={{ width: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
              📋 Approval Queue
            </Link>
          </div>
          <div className="assistant-banner">ℹ️ AI Assistant can make mistakes. Please verify important clinical information.</div>
          {chat && (
            <ChatWindow
              chatId={chat.id}
              messages={chat.messages}
              onSend={handleSend}
              onUploadDone={refresh}
              showLanguageSelector
              quickPrompts={QUICK_PROMPTS}
            />
          )}
        </main>

        <aside className="side-panel">
          <h3 style={{ marginTop: 0 }}>Patient Lookup</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: -4 }}>
            Look up a patient's full chat history by their ID (e.g. PAT-000001)
          </p>
          <PatientLookupBox />

          <h3>Quick Actions</h3>
          <Link to="#" className="side-nav-item">
            ⬆️ Upload New Report
          </Link>
          <Link to="#" className="side-nav-item">
            📁 View All Reports
          </Link>
          <Link to="#" className="side-nav-item">
            📝 Add Clinical Note
          </Link>
          <Link to="#" className="side-nav-item">
            📤 Share with Patient
          </Link>
        </aside>
      </div>

      <p className="disclaimer">
        AI responses are for informational purposes only and not a substitute for professional medical advice.
      </p>
    </div>
  );
}

function PatientLookupBox() {
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  return (
    <form
      className="lookup-form"
      style={{ flexDirection: "column" }}
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) navigate(`/doctor/patients/${value.trim()}`);
      }}
    >
      <input placeholder="PAT-000001" value={value} onChange={(e) => setValue(e.target.value)} />
      <button type="submit">Look up</button>
    </form>
  );
}
