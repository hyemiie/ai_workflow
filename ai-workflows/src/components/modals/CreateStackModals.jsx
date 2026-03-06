import React, { useState } from "react";
import "./CreateStackModals.css";

export default function CreateStackModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const isValid = name.trim().length > 0;

  const handleCreate = () => {
    if (isValid) onCreate(name.trim(), desc.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleCreate();
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h3>Create New Stack</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-field">
            <label htmlFor="stack-name">Name</label>
            <input
              id="stack-name"
              className="form-input"
              type="text"
              placeholder=""
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="stack-desc">Description</label>
            <textarea
              id="stack-desc"
              className="form-textarea"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && onClose()}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-green"
            onClick={handleCreate}
            disabled={!isValid}
          >
            Create
          </button>
        </div>

      </div>
    </div>
  );
}