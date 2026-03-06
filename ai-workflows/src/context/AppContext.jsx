import React, {
  createContext, useContext, useState,
  useRef, useCallback, useEffect,
} from "react";
import * as api from "../services/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [page,        setPage]        = useState("home");
  const [stacks,      setStacks]      = useState([]);
  const [activeStack, setActiveStack] = useState(null);
  const [loading,     setLoading]     = useState(false);

  const tidRef = useRef(0);
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((msg, type = "success") => {
    const id = ++tidRef.current;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  useEffect(() => {
    fetchStacks();
  }, []);

  const fetchStacks = async () => {
    setLoading(true);
    try {
      const data = await api.getStacks();
      setStacks(data);
    } catch (e) {
      addToast("Failed to load stacks", "error");
    } finally {
      setLoading(false);
    }
  };

  const createStack = useCallback(async (name, desc) => {
    const id = `stack_${Date.now()}`;
    try {
      const stack = await api.createStack(id, name, desc);
      setStacks(prev => [stack, ...prev]);
      setActiveStack(stack);
      setPage("editor");
      addToast(`"${name}" created`);
    } catch (e) {
      addToast(e.message || "Failed to create stack", "error");
    }
  }, [addToast]);

  const openEditor = useCallback(async (stack) => {
    try {
      const fresh = await api.getStack(stack.id);
      setActiveStack(fresh);
      setPage("editor");
    } catch (e) {
      setActiveStack(stack);
      setPage("editor");
    }
  }, []);

  const saveWorkflow = useCallback(async (nodes, edges) => {
    if (!activeStack) return;
    console.log("activeStack", activeStack)
    try {
      const updated = await api.saveStack(activeStack.id, {
        name:        activeStack.name,
        description: activeStack.description,
        nodes,
        edges,
      });
      setActiveStack(updated);
      setStacks(prev => prev.map(s => s.id === updated.id ? updated : s));
      addToast("Stack saved!");
    } catch (e) {
      addToast(e.message || "Failed to save", "error");
    }
  }, [activeStack, addToast]);


  const deleteStack = useCallback(async (id) => {
    try {
      await api.deleteStack(id);
      setStacks(prev => prev.filter(s => s.id !== id));
      addToast("Stack deleted");
    } catch (e) {
      addToast(e.message || "Failed to delete", "error");
    }
  }, [addToast]);

  return (
    <AppContext.Provider value={{
      page, setPage,
      stacks, loading,
      activeStack, setActiveStack,
      toasts, addToast,
      createStack,
      openEditor,
      saveWorkflow,
      deleteStack,
      fetchStacks,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);