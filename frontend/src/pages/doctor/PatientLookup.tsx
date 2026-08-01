import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPatientHistory } from "../../api/doctor";
import type { PatientHistoryOut } from "../../api/types";
import { MessageBubble } from "../../components/MessageBubble";
import { Navbar } from "../../components/Navbar";

export function PatientLookup() {
  const { patientId } = useParams<{ patientId: string }>();
  const [history, setHistory] = useState<PatientHistoryOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!patientId) return;
    getPatientHistory(patientId)
      .then(setHistory)
      .catch((err) => setError(err instanceof Error ? err.message : "Patient not found"));
  }, [patientId]);

  return (
    <div>
      <Navbar active="For Doctors" />
      <div className="patient-lookup chat-page">
        <header className="chat-page__header">
          <button onClick={() => navigate("/doctor")}>← Back</button>
          <h2>Patient history: {patientId}</h2>
        </header>
        {error && <p className="error-text">{error}</p>}
        {history && (
          <>
            <p>
              {history.full_name} ({history.patient_public_id})
            </p>
            {history.chats.length === 0 && <p>No chats yet for this patient.</p>}
            {history.chats.map((chat) => (
              <div key={chat.id} className="patient-lookup__chat">
                <h3>{chat.title || "Untitled chat"}</h3>
                {chat.messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
