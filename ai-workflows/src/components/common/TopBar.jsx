import React from "react";
import "./TopBar.css";
import logo from '../../assets/52743efdda66b589899da7047ac6fe05c0f1371f.png'

export default function Topbar({ breadcrumb, onHomeClick, showSave = false, onSave }) {
  return (
    <header className="topbar">
      <button className="topbar-logo" onClick={onHomeClick}>
        <div className="topbar-logo-icon">
         <img src={logo} alt="Logo" width={100} height={30} />
        </div>
        <span className="topbar-logo-text">GenAI Stack</span>
      </button>

      {breadcrumb && (
        <div className="topbar-breadcrumb">
          <button className="breadcrumb-home" onClick={onHomeClick}>My Stacks</button>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{breadcrumb}</span>
        </div>
      )}

      <div className="topbar-right">
        {showSave && (
          <button className="topbar-save-btn" onClick={onSave}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save
          </button>
        )}
        <div className="topbar-avatar">S</div>
      </div>
    </header>
  );
}