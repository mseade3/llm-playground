"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/chat-panel";
import { SidePanel } from "@/components/side-panel";
import { StatusPill } from "@/components/status-pill";
import { useWorkspace } from "@/hooks/use-workspace";

export function Workspace() {
  const {
    state,
    error,
    sending,
    sendMessage,
    resolveApproval,
    setComputerMode,
    addMemory,
    reset,
  } = useWorkspace();

  if (error && !state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#d9efe8_0%,_#eef2f0_45%,_#f5f1ea_100%)] px-6">
        <div className="max-w-md text-center">
          <h1 className="font-heading text-3xl text-stone-900">Dot</h1>
          <p className="mt-3 text-sm text-stone-600">{error}</p>
          <Button className="mt-4 bg-teal-800 hover:bg-teal-700" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#d9efe8_0%,_#eef2f0_45%,_#f5f1ea_100%)]">
        <div className="flex items-center gap-3 text-sm text-stone-600">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-600" />
          </span>
          Waking Dot…
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_#d9efe8_0%,_transparent_42%),radial-gradient(ellipse_at_bottom_right,_#e7e0d4_0%,_transparent_40%),linear-gradient(180deg,_#f3f6f4_0%,_#ebe7df_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(28,70,62,0.12)_0.6px,transparent_0.6px)] [background-size:18px_18px]" />

      <header className="relative z-10 flex items-center justify-between gap-4 border-b border-stone-200/70 bg-white/40 px-4 py-3 backdrop-blur-md md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-800 text-sm font-semibold text-teal-50 shadow-sm">
            ●
          </div>
          <div>
            <h1 className="font-heading text-2xl leading-none tracking-tight text-stone-900 md:text-[1.75rem]">
              Dot
            </h1>
            <p className="mt-0.5 text-xs text-stone-500">
              Always-on agent · cloud computer · asks before it writes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={state.agentStatus} />
          <Button
            variant="ghost"
            size="sm"
            className="hidden text-stone-500 hover:text-stone-800 sm:inline-flex"
            onClick={() => void reset()}
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </header>

      <main className="relative z-10 grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <ChatPanel
          messages={state.messages}
          sending={sending}
          onSend={sendMessage}
        />
        <div className="hidden min-h-0 lg:block">
          <SidePanel
            state={state}
            onApprove={(id) => resolveApproval(id, "approved")}
            onReject={(id) => resolveApproval(id, "rejected")}
            onComputerMode={setComputerMode}
            onAddMemory={addMemory}
          />
        </div>
      </main>

      {/* Mobile side panel as bottom sheet-like stack */}
      <div className="relative z-10 max-h-[42vh] border-t border-stone-200/80 lg:hidden">
        <SidePanel
          state={state}
          onApprove={(id) => resolveApproval(id, "approved")}
          onReject={(id) => resolveApproval(id, "rejected")}
          onComputerMode={setComputerMode}
          onAddMemory={addMemory}
        />
      </div>
    </div>
  );
}
