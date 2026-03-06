import React, { useState, useCallback } from "react";
import { Handle, Position } from "@xyflow/react";
import "./FlowNode.css";
import { uploadDocument, deleteDocument } from "../../services/api";


const SettingsIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

const EyeIcon = ({ show }) => show ? (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);


function PasswordField({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flow-node__input-wrap">
      <input
        className="flow-node__input"
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder ?? "*****************"}
      />
      <button className="flow-node__eye-btn" onClick={() => setShow(s => !s)} tabIndex={-1}>
        <EyeIcon show={show} />
      </button>
    </div>
  );
}


function SelectField({ value, onChange, options }) {
  return (
    <div className="flow-node__select-wrap">
      <select className="flow-node__select" value={value} onChange={onChange}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span className="flow-node__select-chevron"><ChevronDown /></span>
    </div>
  );
}


function Toggle({ checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="toggle-track" />
      <span className="toggle-thumb" />
    </label>
  );
}



function useNodeUpdater(id, data) {
  return useCallback((field, value) => {
    data.onChange?.(id, { [field]: value });
  }, [id, data]);
}


const SEARCH_ENGINE_OPTIONS = [
  { value: "serpapi", label: "SerpAPI (Google)" },
  { value: "brave",   label: "Brave Search"     },
  { value: "tavily",  label: "Tavily"            },
];


const ENGINE_KEY_PLACEHOLDER = {
  serpapi: "SerpAPI key…",
  brave:   "Brave Search API key…",
  tavily:  "Tavily API key…",
};


export function UserQueryNode({ id, data, selected }) {
  const update = useNodeUpdater(id, data);
  const [placeholder, setPlaceholder] = useState(data.placeholder ?? "Write your query here");

  return (
    <div className={`flow-node flow-node--userquery${selected ? " selected" : ""}`}>
      <div className="flow-node__header">
        <div className="flow-node__header-left">
          <div className="flow-node__header-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="5" width="18" height="14" rx="2"/><line x1="7" y1="12" x2="11" y2="12"/>
            </svg>
          </div>
          <span className="flow-node__header-title">User Query</span>
        </div>
        <button className="flow-node__settings-btn"><SettingsIcon /></button>
      </div>

      <p className="flow-node__header-subtitle">Entry point for queries</p>

      <div className="flow-node__body">
        <div className="flow-node__field">
          <p className="flow-node__label">User Query</p>
          <textarea
            className="flow-node__textarea"
            value={placeholder}
            onChange={e => {
              setPlaceholder(e.target.value);
              update("placeholder", e.target.value);
            }}
            placeholder="Write your query here"
          />
        </div>
      </div>

      <div style={{ position: "relative", padding: "4px 11px 8px", display: "flex", justifyContent: "flex-end" }}>
        <span style={{ fontSize: 10, color: "#f97316" }}>Query</span>
      </div>
      <Handle type="source" position={Position.Right} id="query" className="handle-query" style={{ bottom: 16, top: "auto" }} />
    </div>
  );
}


export function KnowledgeNode({ id, data, selected }) {
  const update = useNodeUpdater(id, data);
  const [fileName,    setFileName]    = useState(data.fileName ?? null);
  const [embModel,    setEmbModel]    = useState(data.embModel ?? "gemini-embedding");
  const [apiKey,      setApiKey]      = useState(data.apiKey ?? "");
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!data.stackId) {
      setUploadError("Save the stack first before uploading a file.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const doc = await uploadDocument(data.stackId, id, f, embModel);
      setFileName(f.name);
      update("fileName",   f.name);
      update("docId",      doc.id);
      update("collection", `${data.stackId}_${id}`);
    } catch (err) {
      setUploadError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    if (data.docId) {
      try { await deleteDocument(data.docId); } catch (_) {}
    }
    setFileName(null);
    update("fileName",   null);
    update("docId",      null);
    update("collection", null);
  };

  return (
    <div className={`flow-node flow-node--knowledge${selected ? " selected" : ""}`}>
      <Handle type="target" position={Position.Left} id="query" className="handle-query" />

      <div className="flow-node__header">
        <div className="flow-node__header-left">
          <div className="flow-node__header-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
          </div>
          <span className="flow-node__header-title">Knowledge Base</span>
        </div>
        <button className="flow-node__settings-btn"><SettingsIcon /></button>
      </div>

      <p className="flow-node__header-subtitle">Let LLM search info in your file</p>

      <div className="flow-node__body">
        <div className="flow-node__field">
          <p className="flow-node__label">Embedding Model</p>
          <SelectField
            value={embModel}
            onChange={e => {
              setEmbModel(e.target.value);
              update("embModel", e.target.value);
            }}
            options={[
              { value: "gemini-embedding",        label: "Gemini Embedding"       },
              { value: "text-embedding-3-large",  label: "text-embedding-3-large" },
              { value: "text-embedding-3-small",  label: "text-embedding-3-small" },
              { value: "text-embedding-ada-002",  label: "text-embedding-ada-002" },
            ]}
          />
        </div>

        <div className="flow-node__field">
          <p className="flow-node__label">API Key</p>
          <PasswordField
            value={apiKey}
            onChange={e => {
              setApiKey(e.target.value);
              update("apiKey", e.target.value);
            }}
          />
        </div>

        <div className="flow-node__field">
          <p className="flow-node__label">File for Knowledge Base</p>
          <label>
            <input type="file" accept=".pdf,.txt,.docx" style={{ display: "none" }} onChange={handleFile} disabled={uploading} />
            {fileName ? (
              <div className="flow-node__upload-file">
                <span className="flow-node__upload-filename">{fileName}</span>
                <button className="flow-node__upload-remove" onClick={handleRemove}>
                  <TrashIcon />
                </button>
              </div>
            ) : (
              <div className="flow-node__upload" style={{ opacity: uploading ? 0.6 : 1 }}>
                <span className="flow-node__upload-text">
                  <UploadIcon /> {uploading ? "Uploading…" : "Upload File"}
                </span>
              </div>
            )}
          </label>
          {uploadError && (
            <p style={{ fontSize: 10, color: "#dc2626", marginTop: 4 }}>{uploadError}</p>
          )}
        </div>
      </div>

      <div style={{ padding: "4px 11px 8px", display: "flex", justifyContent: "flex-end" }}>
        <span style={{ fontSize: 10, color: "var(--text-3)" }}>Context</span>
      </div>
      <Handle type="source" position={Position.Right} id="context" style={{ bottom: 16, top: "auto" }} />
    </div>
  );
}


export function LLMNode({ id, data, selected }) {
  const update = useNodeUpdater(id, data);
  const [model,       setModel]       = useState(data.model       ?? "gemini-flash");
  const [apiKey,      setApiKey]      = useState(data.apiKey      ?? "");
  const [prompt,      setPrompt]      = useState(
    data.prompt ??
    "You are a helpful assistant.\nCONTEXT: {context}\nWEB RESULTS: {web_results}\nUser Query: {query}"
  );
  const [temperature, setTemperature] = useState(data.temperature ?? 0.75);
  const [webSearch,   setWebSearch]   = useState(data.webSearch   ?? false);
  const [engine,      setEngine]      = useState(data.engine      ?? "serpapi");
  const [serpApi,     setSerpApi]     = useState(data.serpApi     ?? "");

  return (
    <div className={`flow-node flow-node--llm${selected ? " selected" : ""}`}>
      <Handle type="target" position={Position.Left} id="query"   className="handle-query" style={{ top: "35%" }} />
      <Handle type="target" position={Position.Left} id="context"                           style={{ top: "65%" }} />

      <div className="flow-node__header">
        <div className="flow-node__header-left">
          <div className="flow-node__header-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
            </svg>
          </div>
          <span className="flow-node__header-title">LLM</span>
        </div>
        <button className="flow-node__settings-btn"><SettingsIcon /></button>
      </div>

      <p className="flow-node__header-subtitle">Run a query with an LLM</p>

      <div className="flow-node__body">
        <div className="flow-node__field">
          <p className="flow-node__label">Model</p>
          <SelectField
            value={model}
            onChange={e => { setModel(e.target.value); update("model", e.target.value); }}
            options={[
              { value: "gemini-flash",  label: "Gemini Flash"   },
              { value: "gemini-pro",    label: "Gemini Pro"      },
              { value: "gpt-4o",        label: "GPT-4o"          },
              { value: "gpt-4o-mini",   label: "GPT-4o Mini"     },
              { value: "gpt-4-turbo",   label: "GPT-4 Turbo"     },
              { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo"   },
            ]}
          />
        </div>

        <div className="flow-node__field">
          <p className="flow-node__label">API Key</p>
          <PasswordField
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); update("apiKey", e.target.value); }}
          />
        </div>

        <div className="flow-node__field">
          <p className="flow-node__label">Prompt</p>
          <textarea
            className="flow-node__textarea"
            value={prompt}
            onChange={e => { setPrompt(e.target.value); update("prompt", e.target.value); }}
            style={{ minHeight: 90, fontSize: 11 }}
          />
        </div>

        <div className="flow-node__field">
          <p className="flow-node__label">Temperature</p>
          <input
            className="flow-node__input flow-node__number"
            type="number" min={0} max={2} step={0.05}
            value={temperature}
            onChange={e => {
              const val = parseFloat(e.target.value);
              setTemperature(val);
              update("temperature", val);
            }}
          />
        </div>

        <div className="flow-node__toggle-row">
          <span className="flow-node__toggle-label">WebSearch Tool</span>
          <Toggle
            checked={webSearch}
            onChange={e => { setWebSearch(e.target.checked); update("webSearch", e.target.checked); }}
          />
        </div>

        {webSearch && (
          <>
            <div className="flow-node__field">
              <p className="flow-node__label">Search Engine</p>
              <SelectField
                value={engine}
                onChange={e => { setEngine(e.target.value); update("engine", e.target.value); }}
                options={SEARCH_ENGINE_OPTIONS}
              />
            </div>

            <div className="flow-node__field">
              <p className="flow-node__label">
                {engine === "serpapi" ? "SerpAPI Key"
                  : engine === "brave" ? "Brave API Key"
                  : "Tavily API Key"}
              </p>
              <PasswordField
                value={serpApi}
                placeholder={ENGINE_KEY_PLACEHOLDER[engine]}
                onChange={e => { setSerpApi(e.target.value); update("serpApi", e.target.value); }}
              />
            </div>
          </>
        )}
      </div>

      <div style={{ padding: "4px 11px 8px", display: "flex", justifyContent: "flex-end" }}>
        <span style={{ fontSize: 10, color: "var(--text-3)" }}>Output</span>
      </div>
      <Handle type="source" position={Position.Right} id="out" style={{ bottom: 16, top: "auto" }} />
    </div>
  );
}


export function OutputNode({ data, selected }) {
  const { outputText, running } = data;

  return (
    <div className={`flow-node flow-node--output${selected ? " selected" : ""}`}>
      <Handle type="target" position={Position.Left} id="in" />

      <div className="flow-node__header">
        <div className="flow-node__header-left">
          <div className="flow-node__header-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <span className="flow-node__header-title">Output</span>
        </div>
        <button className="flow-node__settings-btn"><SettingsIcon /></button>
      </div>

      <p className="flow-node__header-subtitle">Output of the result nodes as text</p>

      <div className="flow-node__body">
        <div className="flow-node__field">
          <p className="flow-node__label">Output Text</p>
          <div style={{
            border: "1px solid var(--border-2)",
            borderRadius: "var(--r-sm)",
            padding: "8px",
            minHeight: 52,
            maxHeight: 180,
            overflowY: "auto",
            fontSize: 11,
            color: running ? "var(--text-3)" : outputText ? "var(--text-1)" : "var(--text-3)",
            background: "var(--bg)",
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
          }}>
            {running
              ? "Running workflow…"
              : outputText
              ? outputText
              : "Output will be generated based on query"}
          </div>
        </div>
      </div>

      <div style={{ padding: "4px 11px 8px", display: "flex", justifyContent: "flex-end" }}>
        <span style={{ fontSize: 10, color: running ? "var(--text-3)" : "var(--green)" }}>
          {running ? "⏳ Running…" : "● Output"}
        </span>
      </div>
    </div>
  );
}

export function WebSearchNode({ id, data, selected }) {
  const update = useNodeUpdater(id, data);
  const [engine, setEngine] = useState(data.engine ?? "serpapi");
  const [apiKey, setApiKey] = useState(data.apiKey ?? "");

  return (
    <div className={`flow-node flow-node--websearch${selected ? " selected" : ""}`}>
      <Handle type="target" position={Position.Left} id="query" className="handle-query" />

      <div className="flow-node__header">
        <div className="flow-node__header-left">
          <div className="flow-node__header-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <span className="flow-node__header-title">Web Search</span>
        </div>
        <button className="flow-node__settings-btn"><SettingsIcon /></button>
      </div>

      <p className="flow-node__header-subtitle">Search the web for real-time info</p>

      <div className="flow-node__body">
        <div className="flow-node__field">
          <p className="flow-node__label">Search Engine</p>
          <SelectField
            value={engine}
            onChange={e => { setEngine(e.target.value); update("engine", e.target.value); }}
            options={SEARCH_ENGINE_OPTIONS}
          />
        </div>

        <div className="flow-node__field">
          <p className="flow-node__label">
            {engine === "serpapi" ? "SerpAPI Key"
              : engine === "brave" ? "Brave API Key"
              : "Tavily API Key"}
          </p>
          <PasswordField
            value={apiKey}
            placeholder={ENGINE_KEY_PLACEHOLDER[engine]}
            onChange={e => { setApiKey(e.target.value); update("apiKey", e.target.value); }}
          />
        </div>

        <p style={{ fontSize: 10, color: "var(--text-3)", margin: "4px 0 0", lineHeight: 1.4 }}>
          Connect: UserQuery → WebSearch → LLM
        </p>
      </div>

      <div style={{ padding: "4px 11px 8px", display: "flex", justifyContent: "flex-end" }}>
        <span style={{ fontSize: 10, color: "var(--text-3)" }}>Results</span>
      </div>
      <Handle type="source" position={Position.Right} id="results" style={{ bottom: 16, top: "auto" }} />
    </div>
  );
}


export const NODE_TYPES = {
  userquery:  UserQueryNode,
  llm:        LLMNode,
  knowledge:  KnowledgeNode,
  websearch:  WebSearchNode,
  output:     OutputNode,
};