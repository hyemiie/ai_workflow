import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import HomePage   from "./pages/Home";
import EditorPage from "./pages/EditPage";
import AuthPage   from "./pages/AuthPage";

function AppRouter() {
  const { page, toasts } = useApp();
  const { isAuthenticated } = useAuth();

  // Not logged in — show auth page regardless of requested page
  if (!isAuthenticated) return <AuthPage />;

  return (
    <>
      {page === "editor" ? <EditorPage /> : <HomePage />}

      {/* ---- Toast renderer ---- */}
      <div style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 9999,
        pointerEvents: "none",
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: "10px 18px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            color: "#fff",
            background: t.type === "error" ? "#dc2626" : "#16a34a",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            whiteSpace: "nowrap",
          }}>
            {t.msg}
          </div>
        ))}
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </AuthProvider>
  );
}