"use client";

import { useState } from "react";
import {
  Check,
  Monitor,
  Brain,
  ListTodo,
  Activity,
  X,
  Plus,
  GitPullRequest,
  Shield,
  Plug,
  Layers,
  KeyRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RuleMode, WorkspaceState } from "@/lib/types";
import { cn } from "@/lib/utils";

const RULE_MODES: RuleMode[] = ["allow", "ask", "block"];

export function SidePanel({
  state,
  onApprove,
  onReject,
  onComputerMode,
  onAddMemory,
  onUpdateRule,
  onToggleApp,
  onSelectTask,
  onResolveAuth,
}: {
  state: WorkspaceState;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onComputerMode: (mode: "agent" | "user") => Promise<void>;
  onAddMemory: (
    kind: "preference" | "decision" | "project" | "fact",
    text: string,
  ) => Promise<void>;
  onUpdateRule: (ruleId: string, mode: RuleMode) => Promise<void>;
  onToggleApp: (appId: string) => Promise<void>;
  onSelectTask: (taskId: string) => Promise<void>;
  onResolveAuth: () => Promise<void>;
}) {
  const [memoryText, setMemoryText] = useState("");
  const activeTab =
    state.computer.tabs.find((t) => t.active) ?? state.computer.tabs[0];
  const pending = state.approvals.filter((a) => a.status === "pending");
  const focusTask =
    state.tasks.find((t) => t.id === state.selectedTaskId) ??
    state.tasks.find((t) =>
      ["running", "waiting_approval", "paused", "queued"].includes(t.status),
    ) ??
    state.tasks[0];
  const auth = state.computer.authChallenge;

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-zinc-800 bg-zinc-950/50 backdrop-blur">
      <Tabs defaultValue="threads" className="flex h-full min-h-0 flex-col">
        <div className="border-b border-zinc-800 px-2 pt-3">
          <TabsList className="grid w-full grid-cols-5 bg-zinc-900/80">
            <TabsTrigger value="threads" className="px-1 text-[10px] sm:text-xs">
              <Layers className="mr-0.5 h-3.5 w-3.5" />
              Threads
            </TabsTrigger>
            <TabsTrigger value="computer" className="px-1 text-[10px] sm:text-xs">
              <Monitor className="mr-0.5 h-3.5 w-3.5" />
              Comp
            </TabsTrigger>
            <TabsTrigger value="tasks" className="px-1 text-[10px] sm:text-xs">
              <ListTodo className="mr-0.5 h-3.5 w-3.5" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="rules" className="px-1 text-[10px] sm:text-xs">
              <Shield className="mr-0.5 h-3.5 w-3.5" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="activity" className="px-1 text-[10px] sm:text-xs">
              <Activity className="mr-0.5 h-3.5 w-3.5" />
              Live
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="threads" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="space-y-3 p-3">
              <p className="text-xs text-zinc-500">
                Orchestration rail — click a thread {state.agentName} spun up
                (Codex-style workers, Studio jobs, PR work).
              </p>
              {state.tasks.length === 0 ? (
                <p className="rounded-xl border border-dashed border-zinc-700 px-3 py-8 text-center text-sm text-zinc-500">
                  No threads yet. Hand {state.agentName} a goal.
                </p>
              ) : (
                state.tasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => void onSelectTask(task.id)}
                    className={cn(
                      "w-full rounded-xl border px-3 py-3 text-left transition",
                      state.selectedTaskId === task.id
                        ? "border-teal-500/40 bg-teal-500/10"
                        : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-zinc-100">
                        {task.goal}
                      </p>
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[10px] capitalize"
                      >
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {task.threadLabel ?? "Cloud thread"}
                      {task.workerModel ? ` · ${task.workerModel}` : ""}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-400">
                      Step {Math.min(task.currentStepIndex + 1, task.steps.length)}/
                      {task.steps.length}
                      {task.steps[task.currentStepIndex]
                        ? ` — ${task.steps[task.currentStepIndex]?.title}`
                        : ""}
                    </p>
                  </button>
                ))
              )}

              {state.standingGoals.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    Standing goals
                  </p>
                  {state.standingGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-start justify-between gap-2 rounded-lg bg-zinc-900/70 px-2.5 py-2 ring-1 ring-zinc-800"
                    >
                      <div>
                        <p className="text-xs font-medium text-zinc-200">
                          {goal.title}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {goal.cadence}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] capitalize",
                          goal.status === "acting" &&
                            "bg-teal-500/20 text-teal-200",
                        )}
                      >
                        {goal.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="computer" className="mt-0 min-h-0 flex-1">
          <div className="flex h-full min-h-0 flex-col p-3">
            {auth?.status === "pending" && (
              <div className="mb-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3">
                <div className="flex items-start gap-2">
                  <KeyRound className="mt-0.5 h-4 w-4 text-amber-300" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-100">
                      Login needed · {auth.site}
                    </p>
                    <p className="mt-1 text-xs text-amber-100/80">
                      {auth.message}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="h-8 rounded-lg bg-amber-500 text-xs text-zinc-950 hover:bg-amber-400"
                        onClick={() => void onResolveAuth()}
                      >
                        Finish auth & return
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg border-amber-500/40 text-xs text-amber-100"
                        onClick={() => void onComputerMode("user")}
                      >
                        Take over
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-zinc-100">
                  Cloud computer
                </p>
                <p className="text-xs text-zinc-500">
                  {state.computer.currentAction ?? "Idle"}
                  {state.localComputerConnected
                    ? " · local access on"
                    : " · local off"}
                </p>
              </div>
              <Button
                size="sm"
                variant={state.computer.mode === "user" ? "default" : "outline"}
                className={cn(
                  "rounded-lg text-xs",
                  state.computer.mode === "user" &&
                    "bg-amber-500 text-zinc-950 hover:bg-amber-400",
                )}
                onClick={() =>
                  void onComputerMode(
                    state.computer.mode === "user" ? "agent" : "user",
                  )
                }
              >
                {state.computer.mode === "user" ? "Return control" : "Take over"}
              </Button>
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5">
              {state.apps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => void onToggleApp(app.id)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ring-1 transition",
                    app.connected
                      ? "bg-teal-500/15 text-teal-200 ring-teal-500/30"
                      : "bg-zinc-900 text-zinc-500 ring-zinc-700",
                  )}
                  title={app.detail}
                >
                  <Plug className="h-2.5 w-2.5" />
                  {app.name}
                </button>
              ))}
            </div>

            <div className="mb-2 flex gap-1 overflow-x-auto">
              {state.computer.tabs.map((tab) => (
                <span
                  key={tab.id}
                  className={cn(
                    "shrink-0 rounded-t-md px-2 py-1 text-[11px]",
                    tab.active
                      ? "bg-zinc-200 text-zinc-900"
                      : "bg-zinc-800 text-zinc-400",
                  )}
                >
                  {tab.title}
                </span>
              ))}
            </div>

            <div
              className={cn(
                "flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900/80 shadow-inner transition",
                state.computer.mode === "user" && "ring-2 ring-amber-400/70",
              )}
            >
              <div className="flex items-center gap-2 border-b border-zinc-700 bg-zinc-800/80 px-3 py-2 text-[11px] text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="ml-2 truncate font-mono">{activeTab?.url}</span>
              </div>
              <ScrollArea className="flex-1">
                <div className="space-y-3 p-4 text-sm leading-relaxed text-zinc-300">
                  <h3 className="font-heading text-lg text-zinc-50">
                    {activeTab?.title}
                  </h3>
                  <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-300 md:text-[13px]">
                    {activeTab?.content}
                  </p>
                </div>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-3">
              {pending.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-amber-300">
                    Awaiting approval
                  </p>
                  {pending.map((approval) => (
                    <div
                      key={approval.id}
                      className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3"
                    >
                      <p className="text-sm font-medium text-zinc-50">
                        {approval.title}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {approval.summary}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          className="h-8 rounded-lg bg-teal-500 text-xs text-zinc-950 hover:bg-teal-400"
                          onClick={() => void onApprove(approval.id)}
                        >
                          <Check className="mr-1 h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg border-zinc-600 text-xs"
                          onClick={() => void onReject(approval.id)}
                        >
                          <X className="mr-1 h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {focusTask ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-50">
                      {focusTask.goal}
                    </p>
                    <Badge
                      variant="secondary"
                      className="text-[10px] capitalize"
                    >
                      {focusTask.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <ol className="space-y-2">
                    {focusTask.steps.map((step, index) => (
                      <li
                        key={step.id}
                        className="flex items-start gap-2 text-xs"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px]",
                            step.status === "done" && "bg-teal-500 text-zinc-950",
                            step.status === "running" &&
                              "animate-pulse bg-teal-500/30 text-teal-100",
                            step.status === "pending" &&
                              "bg-zinc-700 text-zinc-400",
                            step.status === "skipped" &&
                              "bg-zinc-600 text-zinc-300",
                          )}
                        >
                          {step.status === "done" ? "✓" : index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-zinc-200">
                            {step.title}
                          </p>
                          {step.detail && (
                            <p className="text-zinc-500">{step.detail}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>

                  {focusTask.pullRequests &&
                    focusTask.pullRequests.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                          <GitPullRequest className="h-3 w-3" />
                          Pull requests
                        </p>
                        {focusTask.pullRequests.map((pr) => (
                          <div
                            key={pr.id}
                            className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-2.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-medium text-zinc-100">
                                #{pr.number} {pr.title}
                              </p>
                              <Badge
                                variant="outline"
                                className="text-[10px] capitalize"
                              >
                                {pr.status}
                              </Badge>
                            </div>
                            <p className="mt-1 text-[11px] text-zinc-500">
                              {pr.repo} · {pr.branch} · {pr.filesChanged} files
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                  {focusTask.artifact && (
                    <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-950/70 p-3 text-[11px] leading-relaxed text-zinc-300 ring-1 ring-zinc-800">
                      {focusTask.artifact}
                    </pre>
                  )}
                </div>
              ) : (
                <p className="px-1 py-8 text-center text-sm text-zinc-500">
                  No active tasks yet.
                </p>
              )}

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-300">
                  <Brain className="h-3.5 w-3.5" />
                  Memory
                </div>
                <form
                  className="mb-2 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!memoryText.trim()) return;
                    void onAddMemory("preference", memoryText.trim());
                    setMemoryText("");
                  }}
                >
                  <Input
                    value={memoryText}
                    onChange={(e) => setMemoryText(e.target.value)}
                    placeholder="Add a preference…"
                    className="h-8 rounded-lg border-zinc-700 bg-zinc-950 text-xs"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-lg bg-teal-500 text-zinc-950 hover:bg-teal-400"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </form>
                <ul className="max-h-36 space-y-1.5 overflow-auto">
                  {state.memory.slice(0, 4).map((note) => (
                    <li key={note.id} className="text-xs text-zinc-400">
                      <span className="capitalize text-zinc-500">
                        {note.kind}:
                      </span>{" "}
                      {note.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="rules" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="space-y-3 p-3">
              <p className="text-xs text-zinc-500">
                Custom rules decide when {state.agentName} can act alone, must
                ask, or must stop.
              </p>
              {state.rules.map((rule) => (
                <div
                  key={rule.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3"
                >
                  <p className="text-sm font-medium text-zinc-100">
                    {rule.label}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {rule.description}
                  </p>
                  <div className="mt-2 flex gap-1">
                    {RULE_MODES.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => void onUpdateRule(rule.id, mode)}
                        className={cn(
                          "rounded-md px-2 py-1 text-[11px] capitalize ring-1 transition",
                          rule.mode === mode
                            ? mode === "allow"
                              ? "bg-teal-500 text-zinc-950 ring-teal-500"
                              : mode === "ask"
                                ? "bg-amber-500 text-zinc-950 ring-amber-500"
                                : "bg-zinc-200 text-zinc-900 ring-zinc-200"
                            : "bg-zinc-950 text-zinc-400 ring-zinc-700 hover:bg-zinc-900",
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="activity" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full">
            <ul className="space-y-2 p-3">
              {state.activity.map((event) => (
                <li
                  key={event.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2"
                >
                  <div className="mb-0.5 flex items-center justify-between gap-2">
                    <Badge
                      variant="secondary"
                      className="text-[10px] capitalize"
                    >
                      {event.type}
                    </Badge>
                    <time className="text-[10px] text-zinc-500">
                      {new Date(event.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </time>
                  </div>
                  <p className="text-xs text-zinc-300">{event.text}</p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
