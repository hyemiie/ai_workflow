const BASE_URL = process.env.SERVER_URL || "http://localhost:8000";
const TOKEN_KEY = "genai_token";

async function request(method, path, body = null, isFormData = false) {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = isFormData ? {} : { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : null,
  });

  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("genai_user");
    window.location.reload();
    return;
  }

  if (!res.ok) {
    let errMsg = `API error ${res.status}`;
    try {
      const err = await res.json();
      errMsg = err.detail || JSON.stringify(err);
    } catch (_) {}
    throw new Error(errMsg);
  }

  if (res.status === 204) return null;

  return res.json();
}

const get    = (path)        => request("GET",    path);
const post   = (path, body)  => request("POST",   path, body);
const patch  = (path, body)  => request("PATCH",  path, body);
const del    = (path)        => request("DELETE", path);
const upload = (path, form)  => request("POST",   path, form, true);


export const getStacks = () => get("/stacks/");

export const createStack = (id, name, desc = "") =>
  post("/stacks/", { id, name, description: desc, workflow: {} });

export const getStack = (id) => get(`/stacks/${id}`);

export const saveStack = (id, { name, description, nodes, edges }) =>
  patch(`/stacks/${id}`, {
    name,
    description,
    workflow: { nodes, edges },
  });

export const deleteStack = (id) => del(`/stacks/${id}`);

export const uploadDocument = (stackId, nodeId, file, embModel = "gemini-embedding") => {
  const form = new FormData();
  form.append("stack_id",  stackId);
  form.append("node_id",   nodeId);
  form.append("emb_model", embModel);
  form.append("file",      file);
  return upload("/documents/upload", form);
};

export const getDocuments = (stackId) => get(`/documents/${stackId}`);
export const deleteDocument = (docId) => del(`/documents/${docId}`);

export const runWorkflow = (stackId, query) =>
  post("/workflow/run", { stack_id: stackId, query });

export const getChatHistory = (stackId) => get(`/chat/${stackId}`);
export const clearChatHistory = (stackId) => del(`/chat/${stackId}`);