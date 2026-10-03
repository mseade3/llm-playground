"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AvatarTone,
  Proactivity,
  RuleMode,
  WorkspaceState,
} from "@/lib/types";

async function fetchState(): Promise<WorkspaceState> {
  const res = await fetch("/api/state", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load workspace");
  return res.json();
}

export function useWorkspace() {
  const [state, setState] = useState<WorkspaceState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchState();
      if (mounted.current) {
        setState(next);
        setError(null);
      }
    } catch (e) {
      if (mounted.current) {
        setError(e instanceof Error ? e.message : "Could not load workspace");
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    const id = window.setInterval(() => {
      void refresh();
    }, 900);
    return () => {
      mounted.current = false;
      window.clearInterval(id);
    };
  }, [refresh]);

  const createDot = useCallback(
    async (payload: {
      name: string;
      tone: AvatarTone;
      connectGmail: boolean;
      connectYoutube: boolean;
    }) => {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          avatarTone: payload.tone,
          connectGmail: payload.connectGmail,
          connectYoutube: payload.connectYoutube,
        }),
      });
      if (!res.ok) throw new Error("Failed to create Dot");
      setState(await res.json());
    },
    [],
  );

  const sendMessage = useCallback(async (message: string) => {
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      setState(await res.json());
    } finally {
      setSending(false);
    }
  }, []);

  const resolveApproval = useCallback(
    async (approvalId: string, decision: "approved" | "rejected") => {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalId, decision }),
      });
      if (!res.ok) throw new Error("Failed to resolve approval");
      setState(await res.json());
    },
    [],
  );

  const setComputerMode = useCallback(async (mode: "agent" | "user") => {
    const res = await fetch("/api/computer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    if (!res.ok) throw new Error("Failed to change computer mode");
    setState(await res.json());
  }, []);

  const resolveAuth = useCallback(async () => {
    const res = await fetch("/api/auth", { method: "POST" });
    if (!res.ok) throw new Error("Failed to resolve auth");
    setState(await res.json());
  }, []);

  const addMemory = useCallback(
    async (
      kind: "preference" | "decision" | "project" | "fact",
      text: string,
    ) => {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, text }),
      });
      if (!res.ok) throw new Error("Failed to save memory");
      setState(await res.json());
    },
    [],
  );

  const updateRule = useCallback(async (ruleId: string, mode: RuleMode) => {
    const res = await fetch("/api/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ruleId, mode }),
    });
    if (!res.ok) throw new Error("Failed to update rule");
    setState(await res.json());
  }, []);

  const toggleApp = useCallback(async (appId: string) => {
    const res = await fetch("/api/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId }),
    });
    if (!res.ok) throw new Error("Failed to toggle app");
    setState(await res.json());
  }, []);

  const setProactivity = useCallback(async (proactivity: Proactivity) => {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proactivity }),
    });
    if (!res.ok) throw new Error("Failed to update proactivity");
    setState(await res.json());
  }, []);

  const selectTask = useCallback(async (taskId: string | null) => {
    const res = await fetch("/api/tasks/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId }),
    });
    if (!res.ok) throw new Error("Failed to select task");
    setState(await res.json());
  }, []);

  const reset = useCallback(async () => {
    const res = await fetch("/api/state", { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to reset");
    setState(await res.json());
  }, []);

  return {
    state,
    error,
    sending,
    refresh,
    createDot,
    sendMessage,
    resolveApproval,
    setComputerMode,
    resolveAuth,
    addMemory,
    updateRule,
    toggleApp,
    setProactivity,
    selectTask,
    reset,
  };
}
