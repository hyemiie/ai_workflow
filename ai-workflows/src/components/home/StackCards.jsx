import React from "react";
import "./StackCards.css";

export default function StackCard({ stack, onEdit }) {
  return (
    <div className="stack-card">
      <p className="stack-card-name">{stack.name}</p>
      <p className="stack-card-desc">{stack.desc}</p>
      <div className="stack-card-footer">
        <button className="edit-stack-btn" onClick={onEdit}>
          Edit Stack
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>
      </div>
    </div>
  );
}