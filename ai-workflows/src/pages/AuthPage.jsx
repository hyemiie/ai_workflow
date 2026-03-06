import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";
import logo from '../assets/52743efdda66b589899da7047ac6fe05c0f1371f.png'


export default function AuthPage() {
  const { login, register, loading, error } = useAuth();
  const [mode,     setMode]     = useState("login"); 
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [localErr, setLocalErr] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalErr(null);

    if (mode === "register") {
      if (password !== confirm) {
        setLocalErr("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setLocalErr("Password must be at least 6 characters.");
        return;
      }
      await register(email, password);
    } else {
      await login(email, password);
    }
  };

  const displayError = localErr || error;

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
               <img src={logo} alt="Logo" width={60} height={60} />

          <p className="auth-logo__subtitle">
            {mode === "login" ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        <div className="auth-tabs">
          {["login", "register"].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setLocalErr(null); }}
              className={`auth-tabs__btn${mode === m ? " auth-tabs__btn--active" : ""}`}
            >
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form__field">
            <label className="auth-form__label">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="auth-form__input"
            />
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="auth-form__input"
            />
          </div>

          {mode === "register" && (
            <div className="auth-form__field">
              <label className="auth-form__label">Confirm Password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="auth-form__input"
              />
            </div>
          )}

          {displayError && (
            <p className="auth-form__error">{displayError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-form__submit"
          >
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

      </div>
    </div>
  );
}