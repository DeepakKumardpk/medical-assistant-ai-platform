import { useEffect, useRef, useState } from "react";
import type { MessageOut } from "../api/types";
import { MessageBubble } from "./MessageBubble";
import { LanguageSelector } from "./LanguageSelector";
import { FileUploader } from "./FileUploader";

export function ChatWindow({
  chatId,
  messages,
  onSend,
  onUploadDone,
  hidePendingContent = false,
  showLanguageSelector = false,
  quickPrompts,
}: {
  chatId: string;
  messages: MessageOut[];
  onSend: (content: string, language: string) => Promise<void>;
  onUploadDone: () => void;
  hidePendingContent?: boolean;
  showLanguageSelector?: boolean;
  quickPrompts?: string[];
}) {
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("en");
  const [sending, setSending] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<MessageOut | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Once the real messages list includes our optimistic message (matched by
  // content, since it doesn't have a real id yet), drop the local copy.
  useEffect(() => {
    if (pendingMessage && messages.some((m) => m.role === "user" && m.content === pendingMessage.content)) {
      setPendingMessage(null);
    }
  }, [messages, pendingMessage]);

  async function handleSend() {
    if (!content.trim() || sending) return;
    const messageText = content;
    setContent("");
    setPendingMessage({
      id: `pending-${Date.now()}`,
      role: "user",
      content: messageText,
      language,
      approval_status: "n/a",
      created_at: new Date().toISOString(),
    });
    setSending(true);
    try {
      await onSend(messageText, language);
    } finally {
      setSending(false);
    }
  }

  const displayMessages = pendingMessage ? [...messages, pendingMessage] : messages;

  return (
    <div className="chat-window">
      <div className="chat-window__messages">
        {displayMessages.length === 0 && (
          <p className="chat-window__empty">Say hello to start the conversation.</p>
        )}
        {displayMessages.map((m) => (
          <MessageBubble key={m.id} message={m} hidePendingContent={hidePendingContent} />
        ))}
        {sending && (
          <div className="message-bubble message-bubble--assistant message-bubble--loading">
            <div className="message-bubble__avatar">🩺</div>
            <div className="message-bubble__body">thinking…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {quickPrompts && quickPrompts.length > 0 && displayMessages.length === 0 && (
        <div className="quick-prompts">
          {quickPrompts.map((p) => (
            <button key={p} className="quick-prompt-btn" onClick={() => setContent(p)}>
              {p}
            </button>
          ))}
        </div>
      )}
      <div className="chat-window__composer">
        <FileUploader chatId={chatId} onDone={onUploadDone} />
        {showLanguageSelector && <LanguageSelector value={language} onChange={setLanguage} />}
        <input
          className="chat-window__input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type your message here…"
          disabled={sending}
        />
        <button className="send-btn" onClick={handleSend} disabled={sending || !content.trim()} title="Send">
          ➤
        </button>
      </div>
    </div>
  );
}
