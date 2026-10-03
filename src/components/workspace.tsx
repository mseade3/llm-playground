"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/chat-panel";
import { DotAvatar } from "@/components/dot-avatar";
import { Onboarding } from "@/components/onboarding";
import { SidePanel } from "@/components/side-panel";
import { StatusPill } from "@/components/status-pill";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useWorkspace } from "@/hooks/use-workspace";
import type { Proactivity } from "@/lib/types";
import { cn } from "@/lib/utils";

const PROACTIVITY: { id: Proactivity; label: string; hint: string }[] = [
  { id: "quiet", label: "Quiet", hint: "Only reply when you ask" },
  { id: "balanced", label: "Balanced", hint: "Important inbox pings" },
  { id: "high", label: "High", hint: "Chatty personal assistant" },
];

export function Workspace() {
  const {
    state,
    error,
    sending,
    createDot,
    sendMessage,
    resolveApproval,
    setComputerMode,
    resolveAuth,
    addMemory,
    updateRule,
    togglePlugin,
    syncPlugin,
    toggleGoal,
    setProactivity,
    selectTask,
    reset,
  } = useWorkspace();
  const [profileOpen, setProfileOpen] = useState(false);

  if (error && !state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
        <div className="max-w-md text-center">
          <h1 className="font-heading text-3xl text-zinc-50">Dot</h1>
          <p className="mt-3 text-sm text-zinc-400">{error}</p>
          <Button
            className="mt-4 bg-teal-500 text-zinc-950 hover:bg-teal-400"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-400" />
          </span>
          Waking your Dot…
        </div>
      </div>
    );
  }

  if (!state.onboarded) {
    return <Onboarding onCreate={createDot} />;
  }

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_rgba(45,140,120,0.16)_0%,_transparent_42%),radial-gradient(ellipse_at_bottom_right,_rgba(20,28,26,0.9)_0%,_transparent_40%),linear-gradient(180deg,_#0b100f_0%,_#101614_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.25] [background-image:radial-gradient(rgba(120,200,180,0.14)_0.6px,transparent_0.6px)] [background-size:18px_18px]" />

      <header className="relative z-10 flex items-center justify-between gap-4 border-b border-zinc-800/80 bg-zinc-950/50 px-4 py-3 backdrop-blur-md md:px-6">
        <div className="flex items-center gap-3">
          <DotAvatar
            tone={state.avatarTone}
            status={state.agentStatus}
            size="md"
          />
          <div>
            <h1 className="font-heading text-2xl leading-none tracking-tight text-zinc-50 md:text-[1.75rem]">
              {state.agentName}
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500">
              Your Dot · orchestrates threads ·{" "}
              {state.proactivity} proactivity
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={state.agentStatus} />
          <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-zinc-100"
                />
              }
            >
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              Profile
            </SheetTrigger>
            <SheetContent
              side="right"
              className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-md"
            >
              <SheetHeader>
                <SheetTitle className="font-heading text-2xl text-zinc-50">
                  {state.agentName}&apos;s profile
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6 px-1">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Computers
                  </p>
                  <div className="space-y-2">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2.5">
                      <p className="text-sm text-zinc-100">
                        {state.agentName}&apos;s cloud computer
                      </p>
                      <p className="text-xs text-zinc-500">
                        Always on · browser + shell
                      </p>
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2.5">
                      <p className="text-sm text-zinc-100">Your local machine</p>
                      <p className="text-xs text-zinc-500">
                        {state.localComputerConnected
                          ? "Connected for Codex / local tasks"
                          : "Disconnected"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Proactivity
                  </p>
                  <div className="grid gap-2">
                    {PROACTIVITY.map((level) => (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => {
                          void setProactivity(level.id);
                        }}
                        className={cn(
                          "rounded-xl border px-3 py-2.5 text-left transition",
                          state.proactivity === level.id
                            ? "border-teal-500/50 bg-teal-500/10"
                            : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700",
                        )}
                      >
                        <p className="text-sm font-medium text-zinc-100">
                          {level.label}
                        </p>
                        <p className="text-xs text-zinc-500">{level.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Connected plugins
                  </p>
                  <p className="mb-2 text-xs text-zinc-500">
                    Manage the full catalog in the Plugins tab — including
                    Canvas, GitHub, and money surfaces.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {state.plugins
                      .filter((p) => p.connected)
                      .map((plugin) => (
                        <button
                          key={plugin.id}
                          type="button"
                          onClick={() => void togglePlugin(plugin.id)}
                          className="rounded-full bg-teal-500/15 px-2.5 py-1 text-[11px] text-teal-200 ring-1 ring-teal-500/30"
                        >
                          {plugin.id}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button
            variant="ghost"
            size="sm"
            className="hidden text-zinc-400 hover:text-zinc-100 sm:inline-flex"
            onClick={() => void reset()}
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </header>

      <main className="relative z-10 grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <ChatPanel
          messages={state.messages}
          sending={sending}
          agentName={state.agentName}
          avatarTone={state.avatarTone}
          agentStatus={state.agentStatus}
          onSend={sendMessage}
        />
        <div className="hidden min-h-0 lg:block">
          <SidePanel
            state={state}
            onApprove={(id) => resolveApproval(id, "approved")}
            onReject={(id) => resolveApproval(id, "rejected")}
            onComputerMode={setComputerMode}
            onAddMemory={addMemory}
            onUpdateRule={updateRule}
            onTogglePlugin={togglePlugin}
            onSyncPlugin={syncPlugin}
            onToggleGoal={toggleGoal}
            onSelectTask={selectTask}
            onResolveAuth={resolveAuth}
          />
        </div>
      </main>

      <div className="relative z-10 max-h-[42vh] border-t border-zinc-800 lg:hidden">
        <SidePanel
          state={state}
          onApprove={(id) => resolveApproval(id, "approved")}
          onReject={(id) => resolveApproval(id, "rejected")}
          onComputerMode={setComputerMode}
          onAddMemory={addMemory}
          onUpdateRule={updateRule}
          onTogglePlugin={togglePlugin}
          onSyncPlugin={syncPlugin}
          onToggleGoal={toggleGoal}
          onSelectTask={selectTask}
          onResolveAuth={resolveAuth}
        />
      </div>
    </div>
  );
}
