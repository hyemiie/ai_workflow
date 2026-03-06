import React, { useState, useRef, useEffect, useCallback } from "react";
import { runWorkflow, getChatHistory, clearChatHistory } from "../../services/api";
import "./Chat.css";


const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const MinimiseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);
const BotIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <path d="M9 11V7a3 3 0 016 0v4"/>
    <circle cx="9"  cy="16" r="1" fill="currentColor"/>
    <circle cx="15" cy="16" r="1" fill="currentColor"/>
  </svg>
);


const TypingIndicator = () => (
  <div className="chat-typing">
    <div className="chat-typing__dot"/>
    <div className="chat-typing__dot"/>
    <div className="chat-typing__dot"/>
  </div>
);

const Message = ({ msg }) => (
  <div className={`chat-msg chat-msg--${msg.role}`}>
    <div className="chat-msg__bubble">{msg.content}</div>
    <span className="chat-msg__time">{formatTime(msg.created_at)}</span>
  </div>
);


export default function ChatModal({ onClose, stackId, stackName = "Chat with Stack" }) {
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [isTyping,  setIsTyping]  = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error,     setError]     = useState(null);
  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!stackId) { setLoadingHistory(false); return; }
    getChatHistory(stackId)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoadingHistory(false));
  }, [stackId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping || !stackId) return;

    setError(null);
    setInput("");
    setIsTyping(true);

    const tempUserMsg = {
      id: `temp_${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const aiMsg = await runWorkflow(stackId, text);
      setMessages(prev => {
        const withoutTemp = prev.filter(m => m.id !== tempUserMsg.id);
        return [
          ...withoutTemp,
          { ...tempUserMsg, id: `user_${Date.now()}` },
          aiMsg,
        ];
      });
    } catch (e) {
      setError(e.message || "Something went wrong. Is your workflow saved and valid?");
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, stackId]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = async () => {
    if (!stackId) return;
    await clearChatHistory(stackId);
    setMessages([]);
  };

  const isEmpty = messages.length === 0 && !isTyping && !loadingHistory;

  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={e => e.stopPropagation()}>

        <div className="chat-modal__header">
          <div className="chat-modal__header-left">
            <div className="chat-modal__avatar"><BotIcon /></div>
            <div>
              <p className="chat-modal__title">{stackName}</p>
              <p className="chat-modal__subtitle">
                {loadingHistory ? "Loading…" : isTyping ? "Thinking…" : "Ready to chat"}
              </p>
            </div>
          </div>
          <div className="chat-modal__header-actions">
            {messages.length > 0 && (
              <button className="chat-modal__icon-btn" title="Clear history" onClick={handleClear}>
                <TrashIcon />
              </button>
            )}
            <button className="chat-modal__icon-btn" title="Minimise" onClick={onClose}>
              <MinimiseIcon />
            </button>
            <button className="chat-modal__icon-btn" title="Close" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="chat-modal__messages">
          {loadingHistory ? (
            <div className="chat-modal__empty">
              <p style={{ color: "var(--text-3)", fontSize: 13 }}>Loading history…</p>
            </div>
          ) : isEmpty ? (
            <div className="chat-modal__empty">
              <div className="chat-modal__empty-icon"><BotIcon /></div>
              <p className="chat-modal__empty-title">Start a conversation</p>
              <p className="chat-modal__empty-desc">
                Ask anything — your query will run through the configured workflow nodes.
              </p>
            </div>
          ) : (
            <>
              {messages.map(msg => <Message key={msg.id} msg={msg} />)}
              {isTyping && <TypingIndicator />}
              <div ref={bottomRef}/>
            </>
          )}
        </div>

        {error && (
          <div style={{
            padding: "8px 14px", background: "#fef2f2",
            borderTop: "1px solid #fecaca", fontSize: 12, color: "#dc2626",
          }}>
            ⚠ {error}
          </div>
        )}

        <div className="chat-modal__footer">
          <div className="chat-modal__input-row">
            <textarea
              ref={textareaRef}
              className="chat-modal__textarea"
              rows={1}
              placeholder="Type your message…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="chat-modal__send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isTyping || !stackId}
              title="Send (Enter)"
            >
              <SendIcon />
            </button>
          </div>
          <p className="chat-modal__hint">Enter to send · Shift+Enter for new line</p>
        </div>

      </div>
    </div>
  );
}