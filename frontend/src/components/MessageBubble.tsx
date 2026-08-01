import type { MessageOut } from "../api/types";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

const ROLE_LABEL: Record<string, string> = { user: "You", assistant: "AI Assistant", system: "System" };
const ROLE_ICON: Record<string, string> = { user: "🧑", assistant: "🩺", system: "📎" };

export function MessageBubble({
  message,
  hidePendingContent = false,
}: {
  message: MessageOut;
  hidePendingContent?: boolean;
}) {
  const isPending = message.approval_status === "pending_review";
  const showPlaceholder = isPending && hidePendingContent;

  return (
    <div className={`message-bubble message-bubble--${message.role}`}>
      <div className="message-bubble__avatar">{ROLE_ICON[message.role] ?? "💬"}</div>
      <div>
        <div className="message-bubble__meta">
          {ROLE_LABEL[message.role] ?? message.role} · {formatTime(message.created_at)}
          {isPending && <span className="badge badge--pending">pending review</span>}
        </div>
        <div className="message-bubble__body">
          <div className="message-bubble__content">
            {showPlaceholder ? "Your care team is reviewing this response…" : message.content}
          </div>
        </div>
        {message.role === "assistant" && !showPlaceholder && (
          <div className="message-bubble__actions">
            <span title="Not implemented">👍</span>
            <span title="Not implemented">👎</span>
            <button
              style={{ border: "none", background: "none", padding: 0, font: "inherit", cursor: "pointer" }}
              onClick={() => navigator.clipboard.writeText(message.content)}
              title="Copy"
            >
              📋
            </button>
            <span title="Not implemented">🔗</span>
          </div>
        )}
      </div>
    </div>
  );
}
