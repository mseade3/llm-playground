"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ComputerPanel } from "@/components/computer-panel";
import { Onboarding } from "@/components/onboarding";
import { OpenDotsChat } from "@/components/opendots-chat";
import { OpenDotsNav } from "@/components/opendots-nav";
import { PluginsPanel } from "@/components/plugins-panel";
import { RiverBackground } from "@/components/river-background";
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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <RiverBackground />
        <div className="relative z-10 max-w-md text-center">
          <h1 className="font-heading text-3xl text-white">OpenDots</h1>
          <p className="mt-3 text-sm text-neutral-400">{error}</p>
          <Button
            className="mt-4 rounded-full bg-white text-black hover:bg-neutral-200"
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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <RiverBackground />
        <div className="relative z-10 flex items-center gap-3 text-sm text-neutral-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/50 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
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
    <div className="relative flex h-dvh overflow-hidden bg-black">
      <RiverBackground />

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
              <h2 className="font-heading text-2xl text-white">Plugins</h2>
              <p className="mt-1 text-sm text-neutral-500">
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
              <h2 className="font-heading text-2xl text-white">Memory</h2>
              <p className="mt-1 text-sm text-neutral-500">
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
                  className="h-10 flex-1 rounded-full border border-neutral-800 bg-black/60 px-4 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-full bg-white text-black hover:bg-neutral-200"
                >
                  Save
                </Button>
              </form>
              <ul className="mt-4 space-y-2">
                {state.memory.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-2xl border border-neutral-800 bg-black/40 px-3 py-2.5 text-sm text-neutral-300"
                  >
                    <span className="mr-2 text-[10px] uppercase tracking-wider text-neutral-600">
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
                  <h2 className="font-heading text-2xl text-white">
                    Settings
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Proactivity, rules, and workspace reset.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-neutral-400"
                  onClick={() => void reset()}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Reset
                </Button>
              </div>

              <div className="mt-6">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Proactivity
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {PROACTIVITY.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => void setProactivity(level.id)}
                      className={cn(
                        "rounded-2xl border px-3 py-2.5 text-left transition",
                        state.proactivity === level.id
                          ? "border-neutral-500 bg-neutral-900"
                          : "border-neutral-800 bg-black/40 hover:border-neutral-700",
                      )}
                    >
                      <p className="text-sm font-medium text-neutral-100">
                        {level.label}
                      </p>
                      <p className="text-xs text-neutral-500">{level.hint}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Custom rules
                </p>
                <div className="space-y-2">
                  {state.rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-neutral-800 bg-black/40 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm text-neutral-100">{rule.label}</p>
                        <p className="text-xs text-neutral-500">
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
                              "rounded-full px-2.5 py-1 text-[11px] capitalize",
                              rule.mode === mode
                                ? "bg-white text-black"
                                : "bg-neutral-900 text-neutral-500",
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

      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1 rounded-full border border-neutral-800 bg-black/90 p-1 lg:hidden">
        <button
          type="button"
          onClick={() => setMobilePane("chat")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs",
            mobilePane === "chat"
              ? "bg-neutral-800 text-white"
              : "text-neutral-500",
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
              ? "bg-neutral-800 text-white"
              : "text-neutral-500",
          )}
        >
          Computer
        </button>
      </div>
    </div>
  );
}
