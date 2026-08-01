import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createChat, getChat, listChats, postMessage } from "../../api/chats";
import type { ChatDetail, ChatSummary } from "../../api/types";
import { Navbar } from "../../components/Navbar";
import { ChatWindow } from "../../components/ChatWindow";
import { AppointmentModal } from "../../components/AppointmentModal";
import { useAuth } from "../../auth/AuthContext";

const QUICK_PROMPTS = [
  "Understand my blood report",
  "Check my medications for interactions",
  "What are these symptoms I have?",
  "Assess my health risk",
  "General health tips for me",
];

export function PatientAssistant() {
  const { chatId } = useParams<{ chatId: string }>();
  const [chat, setChat] = useState<ChatDetail | null>(null);
  const [chatList, setChatList] = useState<ChatSummary[]>([]);
  const [showAppointment, setShowAppointment] = useState(false);
  const { publicId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    listChats().then(setChatList);
  }, [chat?.id]);

  useEffect(() => {
    if (!chatId) {
      createChat().then((c) => navigate(`/patient/chat/${c.id}`, { replace: true }));
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

  async function handleNewChat() {
    const c = await createChat();
    navigate(`/patient/chat/${c.id}`);
  }

  return (
    <div className="app-shell--fixed">
      <Navbar />
      <div className="assistant-layout">
        <aside className="side-panel">
          <div>
            <strong>AI Health Assistant</strong>
            <div className="dashboard__subtitle">Powered by Advanced AI</div>
          </div>

          <h3>Menu</h3>
          <button className="side-nav-item active" onClick={handleNewChat}>
            💬 New Chat
          </button>
          <Link to="#" className="side-nav-item">
            🕐 Chat History
          </Link>
          <Link to="#" className="side-nav-item">
            ⬆️ Upload Reports
          </Link>
          <Link to="#" className="side-nav-item">
            📋 Health Records
          </Link>

          {chatList.length > 0 && (
            <>
              <h3>Recent Chats</h3>
              {chatList.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  className={`side-nav-item ${c.id === chatId ? "active" : ""}`}
                  onClick={() => navigate(`/patient/chat/${c.id}`)}
                >
                  💭 {(c.title || "New chat").slice(0, 26)}
                </button>
              ))}
            </>
          )}

          <h3>Popular Topics</h3>
          <Link to="#" className="side-nav-item">
            📄 Understand Blood Reports
          </Link>
          <Link to="#" className="side-nav-item">
            💊 Medication Information
          </Link>
          <Link to="#" className="side-nav-item">
            🩺 Symptoms Checker
          </Link>
          <Link to="#" className="side-nav-item">
            🛡️ Risk Assessment
          </Link>
          <Link to="#" className="side-nav-item">
            📖 General Health Tips
          </Link>

          <div className="side-panel__footer">
            <div style={{ fontSize: 13, fontWeight: 600 }}>Need immediate help?</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
              Talk to our support team
            </div>
            <Link to="#" style={{ display: "block", textAlign: "center", padding: "8px", border: "1px solid var(--border)", borderRadius: 8, textDecoration: "none", fontSize: 13 }}>
              Contact Support
            </Link>
          </div>
        </aside>

        <main className="assistant-main">
          <div className="assistant-main__header">
            <div className="assistant-main__title">
              <div className="assistant-main__title-icon">🩺</div>
              <div>
                <h2>AI Health Assistant</h2>
                <div className="assistant-main__online">
                  <span className="status-dot" /> Online
                </div>
              </div>
            </div>
            <button onClick={() => setShowAppointment(true)}>📅 Book Appointment</button>
          </div>
          {chat && (
            <ChatWindow
              chatId={chat.id}
              messages={chat.messages}
              onSend={handleSend}
              onUploadDone={refresh}
              hidePendingContent
              showLanguageSelector
              quickPrompts={QUICK_PROMPTS}
            />
          )}
        </main>

        <aside className="side-panel">
          <h3 style={{ marginTop: 0 }}>Chat Summary</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: -4 }}>
            Populated once you discuss an uploaded report
          </p>

          <h3>Quick Actions</h3>
          <Link to="#" className="side-nav-item">
            ⬆️ Upload New Report
          </Link>
          <Link to="#" className="side-nav-item">
            📁 View Health Records
          </Link>
          <Link to="#" className="side-nav-item">
            🧪 Book Lab Test
          </Link>
          <Link to="#" className="side-nav-item">
            👨‍⚕️ Talk to Doctor
          </Link>

          <div style={{ marginTop: 14 }}>
            <div className="info-card info-card--emergency">
              <h4>🚑 Emergency Care</h4>
              <p>For medical emergencies available 24x7</p>
              <div style={{ fontWeight: 700, color: "var(--danger)" }}>+91 1234 567 890 (sample)</div>
            </div>
            <div className="info-card info-card--security">
              <h4>🛡️ Security &amp; Privacy</h4>
              <p>Your health data is encrypted and HIPAA compliant.</p>
              <Link to="#">Learn More</Link>
            </div>
          </div>
        </aside>
      </div>

      <p className="disclaimer">
        AI responses are for informational purposes only and not a substitute for professional
        medical advice. {publicId && `Logged in as ${publicId}.`}
      </p>

      {showAppointment && <AppointmentModal onClose={() => setShowAppointment(false)} onBooked={() => {}} />}
    </div>
  );
}
