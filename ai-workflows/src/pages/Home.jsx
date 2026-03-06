import React, { useState } from "react";
import "./home.css";
import Topbar from "../components/common/TopBar";
import { useApp } from "../context/AppContext";
import StackCard from "../components/home/StackCards";
import CreateStackModal from "../components/modals/CreateStackModals";

export default function HomePage() {
  const { stacks, createStack, openEditor } = useApp();
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = (name, desc) => {
    setShowCreate(false);
    createStack(name, desc);
  };

   return (
    <div className="home-page">
      <Topbar onHomeClick={() => {}} />
      <main className="home-main">
        <div className="home-header">
          <h1 className="home-title">My Stacks</h1>
          <button className="btn btn-green" onClick={() => setShowCreate(true)}>
            + New Stack
          </button>
        </div>
        <hr className="home-divider" />

        {stacks.length === 0 ? (
          <div className="home-empty">
            <div className="empty-card">
              <h3>Create New Stack</h3>
              <p>Start building your generative AI apps with our essential tools and frameworks</p>
              <button className="btn btn-green" onClick={() => setShowCreate(true)}>
                + New Stack
              </button>
            </div>
          </div>
        ) : (
          <div className="stacks-grid">
            {stacks.map((stack) => (
              <StackCard
                key={stack.id}
                stack={stack}
                onEdit={() => openEditor(stack)} 
              />
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateStackModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}