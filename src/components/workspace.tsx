"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ComputerPanel } from "@/components/computer-panel";
import { Onboarding } from "@/components/onboarding";
import { OpenDotsChat } from "@/components/opendots-chat";
import { OpenDotsNav } from "@/components/opendots-nav";
import { PluginsPanel } from "@/components/plugins-panel";
import { SpaceWorkspace } from "@/components/space-workspace";
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
    selectDot,
    selectSpace,
    selectPage,
    setView,
    setComputerTab,
    reset,
  } = useWorkspace();
  const [memoryText, setMemoryText] = useState("");
  const [mobilePane, setMobilePane] = useState<"chat" | "computer">("chat");

  if (error && !state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
        <div className="max-w-md text-center">
          <h1 className="font-heading text-3xl text-zinc-50">OpenDots</h1>
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
          Waking OpenDots…
        </div>
      </div>
    );
  }

  if (!state.onboarded) {
    return <Onboarding onCreate={createDot} />;
  }

  const activeDot =
    state.dots.find((d) => d.id === state.selectedDotId) ?? state.dots[0];

  return (
    <div className="relative flex h-dvh overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_rgba(45,140,120,0.12)_0%,_transparent_40%),linear-gradient(180deg,_#0a0e0d_0%,_#101614_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.2] [background-image:radial-gradient(rgba(120,200,180,0.12)_0.55px,transparent_0.55px)] [background-size:16px_16px]" />

      <div className="relative z-10 hidden w-[240px] shrink-0 lg:block">
        <OpenDotsNav
          state={state}
          onSelectDot={(id) => void selectDot(id)}
          onSelectSpace={(id) => void selectSpace(id)}
          onSetView={(view) => void setView(view)}
        />
      </div>

      <main className="relative z-10 grid min-w-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
        <div
          className={cn(
            "min-h-0",
            mobilePane === "computer" && "hidden lg:block",
          )}
        >
          {state.view === "chat" && (
            <OpenDotsChat
              state={state}
              dot={activeDot}
              sending={sending}
              onSend={sendMessage}
              onApprove={(id) => resolveApproval(id, "approved")}
              onReject={(id) => resolveApproval(id, "rejected")}
            />
          )}

          {state.view === "space" && (
            <SpaceWorkspace
              state={state}
              onSelectPage={(spaceId, pageId) =>
                void selectPage(spaceId, pageId)
              }
            />
          )}

          {state.view === "plugins" && (
            <div className="h-full overflow-y-auto p-4 md:p-6">
              <h2 className="font-heading text-2xl text-zinc-50">Plugins</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Life surfaces your Dots can sync — Canvas, GitHub, and more.
              </p>
              <div className="mt-4">
                <PluginsPanel
                  state={state}
                  onToggle={togglePlugin}
                  onSync={syncPlugin}
                  onToggleGoal={toggleGoal}
                />
              </div>
            </div>
          )}

          {state.view === "memory" && (
            <div className="h-full overflow-y-auto p-4 md:p-6">
              <h2 className="font-heading text-2xl text-zinc-50">Memory</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Shared notes across Scout, Quill, and Relay — AADE, roles, and apps.
              </p>
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!memoryText.trim()) return;
                  void addMemory("fact", memoryText.trim()).then(() =>
                    setMemoryText(""),
                  );
                }}
              >
                <input
                  value={memoryText}
                  onChange={(e) => setMemoryText(e.target.value)}
                  placeholder="Add a memory…"
                  className="h-10 flex-1 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 text-sm text-zinc-100 outline-none focus:border-teal-500/40"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-teal-500 text-zinc-950 hover:bg-teal-400"
                >
                  Save
                </Button>
              </form>
              <ul className="mt-4 space-y-2">
                {state.memory.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-300"
                  >
                    <span className="mr-2 text-[10px] uppercase tracking-wider text-zinc-500">
                      {m.kind}
                    </span>
                    {m.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {state.view === "settings" && (
            <div className="h-full overflow-y-auto p-4 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-2xl text-zinc-50">
                    Settings
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Proactivity, rules, and workspace reset.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400"
                  onClick={() => void reset()}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Reset
                </Button>
              </div>

              <div className="mt-6">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Proactivity
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {PROACTIVITY.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => void setProactivity(level.id)}
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

              <div className="mt-8">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Custom rules
                </p>
                <div className="space-y-2">
                  {state.rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm text-zinc-100">{rule.label}</p>
                        <p className="text-xs text-zinc-500">
                          {rule.description}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {(["allow", "ask", "block"] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => void updateRule(rule.id, mode)}
                            className={cn(
                              "rounded-md px-2 py-1 text-[11px] capitalize",
                              rule.mode === mode
                                ? "bg-teal-500/20 text-teal-200"
                                : "bg-zinc-800 text-zinc-500",
                            )}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className={cn(
            "min-h-0",
            mobilePane === "chat" && "hidden lg:block",
          )}
        >
          <ComputerPanel
            state={state}
            dot={activeDot}
            onComputerMode={setComputerMode}
            onResolveAuth={resolveAuth}
            onTab={(tab) => void setComputerTab(tab)}
          />
        </div>
      </main>

      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1 rounded-full border border-zinc-800 bg-zinc-950/90 p-1 lg:hidden">
        <button
          type="button"
          onClick={() => setMobilePane("chat")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs",
            mobilePane === "chat"
              ? "bg-zinc-800 text-zinc-50"
              : "text-zinc-500",
          )}
        >
          Chat
        </button>
        <button
          type="button"
          onClick={() => setMobilePane("computer")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs",
            mobilePane === "computer"
              ? "bg-zinc-800 text-zinc-50"
              : "text-zinc-500",
          )}
        >
          Computer
        </button>
      </div>
    </div>
  );
}
