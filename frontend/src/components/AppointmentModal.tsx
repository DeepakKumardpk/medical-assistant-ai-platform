import { useState } from "react";
import { requestAppointment } from "../api/appointments";

export function AppointmentModal({ onClose, onBooked }: { onClose: () => void; onBooked: () => void }) {
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!time) {
      setError("Pick a date/time");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await requestAppointment(new Date(time).toISOString(), reason);
      onBooked();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request appointment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Request an appointment</h3>
        <label>
          Date &amp; time
          <input type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <label>
          Reason
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
        </label>
        {error && <p className="error-text">{error}</p>}
        <div className="modal__actions">
          <button onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}>
            Request
          </button>
        </div>
      </div>
    </div>
  );
}
