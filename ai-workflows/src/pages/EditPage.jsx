import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState, ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import Topbar from "../components/common/TopBar";
import { NODE_TYPES } from "../components/nodes/FlowNode";
import { useApp } from "../context/AppContext";
import "./EditPage.css";
import ChatModal from "./chat/Chat";


const PALETTE = [
  {
    type: "userquery", label: "User Query",
    icon: <svg className="component-pill__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="7" y1="12" x2="11" y2="12"/></svg>,
  },
  {
    type: "llm", label: "LLM (OpenAI)",
    icon: <svg className="component-pill__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>,
  },
  {
    type: "knowledge", label: "Knowledge Base",
    icon: <svg className="component-pill__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
  },
  {
    type: "websearch", label: "Web Search",
    icon: <svg className="component-pill__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  },
  {
    type: "output", label: "Output",
    icon: <svg className="component-pill__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  },
];

const DragIcon = () => (
  <svg className="component-pill__drag-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9"  cy="5"  r="1" fill="currentColor"/>
    <circle cx="15" cy="5"  r="1" fill="currentColor"/>
    <circle cx="9"  cy="12" r="1" fill="currentColor"/>
    <circle cx="15" cy="12" r="1" fill="currentColor"/>
    <circle cx="9"  cy="19" r="1" fill="currentColor"/>
    <circle cx="15" cy="19" r="1" fill="currentColor"/>
  </svg>
);


let nodeIdCounter = 1;
const newId = () => `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

function FlowEditor() {
  const { activeStack, setPage, saveWorkflow, addToast } = useApp();

  const reactFlowWrapper = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);

  const savedNodes = activeStack?.workflow?.nodes ?? [];
  const savedEdges = activeStack?.workflow?.edges ?? [];

  const [nodes, setNodes, onNodesChange] = useNodesState(savedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(savedEdges);
  const [saving,   setSaving]   = useState(false);
  const [running,  setRunning]  = useState(false);
  const [showChat, setShowChat] = useState(false);

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  const onNodeDataChange = useCallback((nodeId, newData) => {
    setNodes(nds =>
      nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n)
    );
  }, [setNodes]);

  useEffect(() => {
    if (activeStack?.workflow?.nodes) {
      setNodes(
        activeStack.workflow.nodes.map(n => ({
          ...n,
          data: { ...n.data, onChange: onNodeDataChange, stackId: activeStack?.id },
        }))
      );
    }
    if (activeStack?.workflow?.edges) setEdges(activeStack.workflow.edges);
  }, [activeStack?.id]);

  const onConnect = useCallback(
    (params) => setEdges((eds) =>
      addEdge({ ...params, animated: true, style: { stroke: "#3d8b47", strokeWidth: 2 } }, eds)
    ),
    [setEdges]
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/node-type");
    if (!type || !rfInstance) return;
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = rfInstance.screenToFlowPosition({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    });
    setNodes((nds) => [
      ...nds,
      {
        id: newId(),
        type,
        position,
        data: { label: type, onChange: onNodeDataChange, stackId: activeStack?.id },
      },
    ]);
  }, [rfInstance, setNodes, onNodeDataChange]);

  const onDragStart = (e, type) => {
    e.dataTransfer.setData("application/node-type", type);
    e.dataTransfer.effectAllowed = "move";
  };


const validateWorkflow = useCallback((currentNodes, currentEdges) => {
  const errors = [];

 
  console.log("nodes:", currentNodes.map(n => ({ id: n.id, type: n.type })));
  console.log("edges:", currentEdges.map(e => ({
    from: currentNodes.find(n => n.id === e.source)?.type,
    to:   currentNodes.find(n => n.id === e.target)?.type,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
  })));

  const hasType = (t) => currentNodes.some(n => n.type === t);

  const hasEdge = (sourceType, targetType) => {
    const found = currentEdges.some(e => {
      const srcNode = currentNodes.find(n => n.id === e.source);
      const tgtNode = currentNodes.find(n => n.id === e.target);
      return srcNode?.type === sourceType && tgtNode?.type === targetType;
    });
    console.log(`hasEdge(${sourceType} → ${targetType}):`, found);
    return found;
  };

  const hasKB = hasType("knowledge");
  const hasWS = hasType("websearch");

  if (!hasType("userquery")) errors.push("Missing a User Query node.");
  if (!hasType("llm"))       errors.push("Missing an LLM node.");
  if (!hasType("output"))    errors.push("Missing an Output node.");

  if (!hasEdge("userquery", "llm"))
    errors.push("LLM: query input is not connected to User Query.");
  if (!hasEdge("llm", "output"))
    errors.push("LLM: output is not connected to Output node.");

  if (hasKB) {
    if (!hasEdge("userquery", "knowledge"))
      errors.push("Knowledge Base: query input is not connected to User Query.");
    if (!hasEdge("knowledge", "llm"))
      errors.push("Knowledge Base: context output is not connected to LLM.");
  }

  if (hasWS) {
    if (!hasEdge("userquery", "websearch"))
      errors.push("Web Search: query input is not connected to User Query.");
    if (!hasEdge("websearch", "llm"))
      errors.push("Web Search: results output is not connected to LLM.");
  }

  console.log("errors:", errors);
  return errors;
}, []);


  const handleSave = async () => {
const errors = validateWorkflow(nodesRef.current, edgesRef.current);
    if (errors.length > 0) {
      errors.forEach(msg => addToast(msg, "error"));
      return;
    }

    setSaving(true);
    try {
      const serialisableNodes = nodesRef.current.map(({ data: { onChange, ...restData }, ...rest }) => ({
        ...rest,
        data: restData,
      }));
      await saveWorkflow(serialisableNodes, edgesRef.current);
    } finally {
      setSaving(false);
    }

    const userQueryNode = nodesRef.current.find(n => n.type === "userquery");
    const query = userQueryNode?.data?.placeholder?.trim();
    if (!query) {
      addToast("Enter a query in the User Query node first.", "error");
      return;
    }

    const outputNode = nodesRef.current.find(n => n.type === "output");
    if (outputNode) onNodeDataChange(outputNode.id, { outputText: null, running: true });

    setRunning(true);
    try {
      const { runWorkflow } = await import("../services/api");
      const result = await runWorkflow(activeStack.id, query);
      const answer = result?.content ?? result?.answer ?? result?.output ?? JSON.stringify(result);
if (outputNode) onNodeDataChange(outputNode.id, { outputText: answer, running: false });

      addToast("Workflow ran successfully!");
    } catch (e) {
      if (outputNode) onNodeDataChange(outputNode.id, { outputText: null, running: false });
      addToast(e.message || "Workflow run failed.", "error");
    } finally {
      setRunning(false);
    }
  };

  const handleOpenChat = () => {
const errors = validateWorkflow(nodesRef.current, edgesRef.current);
    if (errors.length > 0) {
      errors.forEach(msg => addToast(msg, "error"));
      return;
    }
    setShowChat(true);
  };

  const chatInitialMessage = nodesRef.current.find(n => n.type === "userquery")?.data?.placeholder ?? "";

  const isEmpty = nodes.length === 0;

  return (
    <div className="editor-page">
      <Topbar
        breadcrumb={activeStack?.name ?? "Untitled"}
        onHomeClick={() => setPage("home")}
        showSave
        onSave={handleSave}
        saving={saving}
      />

      <div className="editor-body">
        <aside className="editor-sidebar">
          <div className="editor-sidebar__stack-name">
            <span>{activeStack?.name ?? "Untitled"}</span>
            <button className="editor-sidebar__rename-btn" title="Rename">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>

          <p className="editor-sidebar__label">Componenets</p>

          {PALETTE.map((item) => (
            <div
              key={item.type}
              className="component-pill"
              draggable
              onDragStart={(e) => onDragStart(e, item.type)}
            >
              <div className="component-pill__left">
                {item.icon}
                <span className="component-pill__name">{item.label}</span>
              </div>
              <DragIcon />
            </div>
          ))}
        </aside>

        <div className="editor-canvas" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={NODE_TYPES}
            fitView
            deleteKeyCode="Delete"
            style={{ width: "100%", height: "100%" }}
          >
            <Background variant="dots" gap={22} size={1} color="#c8c8c8" />
            <Controls position="bottom-center" showInteractive={false} />
            <MiniMap
              nodeColor={(n) => ({
                userquery: "#2563eb", llm: "#7c3aed",
                knowledge: "#d97706", websearch: "#db2777", output: "#16a34a",
              }[n.type] ?? "#aaa")}
              style={{ bottom: 70, right: 14 }}
            />
          </ReactFlow>

          {isEmpty && (
            <div className="editor-canvas__empty" style={{ pointerEvents: "none" }}>
              <div className="editor-canvas__empty-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 11V6a2 2 0 114 0v5"/>
                  <path d="M13 11V9a2 2 0 114 0v2"/>
                  <path d="M17 11v-1a2 2 0 114 0v4a6 6 0 01-6 6H9a6 6 0 01-6-6v-2a2 2 0 114 0v2"/>
                </svg>
              </div>
              <span className="editor-canvas__empty-text">Drag &amp; drop to get started</span>
            </div>
          )}

          <div className="canvas-fabs">
            <button className="fab fab--run" onClick={handleSave} title="Build Stack">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </button>
            <button className="fab fab--chat" onClick={handleOpenChat} title="Chat with stack">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </button>
          </div>

          {showChat && (
            <ChatModal
              onClose={() => setShowChat(false)}
              stackId={activeStack?.id}
              stackName={activeStack?.name ?? "Chat with Stack"}
              initialMessage={chatInitialMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}