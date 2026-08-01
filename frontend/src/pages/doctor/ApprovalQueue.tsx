import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { decideApproval, listApprovals } from "../../api/doctor";
import type { ApprovalOut } from "../../api/types";
import { Navbar } from "../../components/Navbar";

export function ApprovalQueue() {
  const [approvals, setApprovals] = useState<ApprovalOut[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  function refresh() {
    setLoading(true);
    listApprovals()
      .then((data) => {
        setApprovals(data);
        setDrafts(Object.fromEntries(data.map((a) => [a.id, a.message_content])));
      })
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handleDecision(id: string, decision: "approve" | "edit" | "reject") {
    await decideApproval(id, decision, decision === "edit" ? drafts[id] : undefined);
    refresh();
  }

  return (
    <div>
      <Navbar active="For Doctors" />
      <div className="approval-queue chat-page">
        <header className="chat-page__header">
          <button onClick={() => navigate("/doctor")}>← Back</button>
          <h2>Approval queue</h2>
        </header>
        {loading && <p>Loading…</p>}
        {!loading && approvals.length === 0 && <p>Nothing pending review.</p>}
        {approvals.map((approval) => (
          <div key={approval.id} className="approval-card">
            <p className="approval-card__patient">Patient: {approval.patient_id}</p>
            <textarea
              rows={4}
              value={drafts[approval.id] ?? ""}
              onChange={(e) => setDrafts((d) => ({ ...d, [approval.id]: e.target.value }))}
            />
            <div className="approval-card__actions">
              <button onClick={() => handleDecision(approval.id, "approve")}>Approve as-is</button>
              <button onClick={() => handleDecision(approval.id, "edit")}>Save edit &amp; approve</button>
              <button onClick={() => handleDecision(approval.id, "reject")}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
