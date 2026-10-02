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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkspaceState } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SidePanel({
  state,
  onApprove,
  onReject,
  onComputerMode,
  onAddMemory,
}: {
  state: WorkspaceState;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onComputerMode: (mode: "agent" | "user") => Promise<void>;
  onAddMemory: (
    kind: "preference" | "decision" | "project" | "fact",
    text: string,
  ) => Promise<void>;
}) {
  const [memoryText, setMemoryText] = useState("");
  const activeTab = state.computer.tabs.find((t) => t.active) ?? state.computer.tabs[0];
  const pending = state.approvals.filter((a) => a.status === "pending");
  const activeTask = state.tasks.find((t) =>
    ["running", "waiting_approval", "paused", "queued"].includes(t.status),
  );

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-stone-200/80 bg-white/50 backdrop-blur">
      <Tabs defaultValue="computer" className="flex h-full min-h-0 flex-col">
        <div className="border-b border-stone-200/70 px-3 pt-3">
          <TabsList className="grid w-full grid-cols-4 bg-stone-100/80">
            <TabsTrigger value="computer" className="text-xs">
              <Monitor className="mr-1 h-3.5 w-3.5" />
              Comp
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs">
              <ListTodo className="mr-1 h-3.5 w-3.5" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="memory" className="text-xs">
              <Brain className="mr-1 h-3.5 w-3.5" />
              Memory
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">
              <Activity className="mr-1 h-3.5 w-3.5" />
              Live
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="computer" className="mt-0 min-h-0 flex-1">
          <div className="flex h-full min-h-0 flex-col p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-stone-800">Cloud computer</p>
                <p className="text-xs text-stone-500">
                  {state.computer.currentAction ?? "Idle"}
                </p>
              </div>
              <Button
                size="sm"
                variant={state.computer.mode === "user" ? "default" : "outline"}
                className={cn(
                  "rounded-lg text-xs",
                  state.computer.mode === "user" &&
                    "bg-amber-700 text-white hover:bg-amber-600",
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

            <div className="mb-2 flex gap-1 overflow-x-auto">
              {state.computer.tabs.map((tab) => (
                <span
                  key={tab.id}
                  className={cn(
                    "shrink-0 rounded-t-md px-2 py-1 text-[11px]",
                    tab.active
                      ? "bg-stone-800 text-stone-50"
                      : "bg-stone-200/80 text-stone-600",
                  )}
                >
                  {tab.title}
                </span>
              ))}
            </div>

            <div
              className={cn(
                "flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-stone-200 bg-[#f7f4ef] shadow-inner transition",
                state.computer.mode === "user" && "ring-2 ring-amber-400",
              )}
            >
              <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-100 px-3 py-2 text-[11px] text-stone-500">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="ml-2 truncate font-mono">{activeTab?.url}</span>
              </div>
              <ScrollArea className="flex-1">
                <div className="space-y-3 p-4 text-sm leading-relaxed text-stone-700">
                  <h3 className="font-heading text-lg text-stone-900">
                    {activeTab?.title}
                  </h3>
                  <p className="whitespace-pre-wrap">{activeTab?.content}</p>
                  {state.computer.mode === "user" && (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200">
                      You have control. Dot is paused until you return it.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="mt-3 max-h-24 overflow-hidden">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-stone-400">
                Computer log
              </p>
              <ul className="space-y-1 text-[11px] text-stone-500">
                {state.computer.logs.slice(0, 4).map((log, i) => (
                  <li key={`${log}-${i}`} className="truncate">
                    • {log}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-3">
              {pending.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-amber-700">
                    Awaiting approval
                  </p>
                  {pending.map((approval) => (
                    <div
                      key={approval.id}
                      className="rounded-xl border border-amber-200 bg-amber-50/80 p-3"
                    >
                      <p className="text-sm font-medium text-stone-900">
                        {approval.title}
                      </p>
                      <p className="mt-1 text-xs text-stone-600">
                        {approval.summary}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          className="h-8 rounded-lg bg-teal-800 text-xs hover:bg-teal-700"
                          onClick={() => void onApprove(approval.id)}
                        >
                          <Check className="mr-1 h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg text-xs"
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

              {activeTask ? (
                <div className="rounded-xl border border-stone-200 bg-white/80 p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-stone-900">
                      {activeTask.goal}
                    </p>
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      {activeTask.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <ol className="space-y-2">
                    {activeTask.steps.map((step, index) => (
                      <li key={step.id} className="flex items-start gap-2 text-xs">
                        <span
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px]",
                            step.status === "done" && "bg-teal-700 text-white",
                            step.status === "running" &&
                              "animate-pulse bg-teal-200 text-teal-900",
                            step.status === "pending" && "bg-stone-200 text-stone-500",
                            step.status === "skipped" && "bg-stone-300 text-stone-600",
                          )}
                        >
                          {step.status === "done" ? "✓" : index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-stone-800">{step.title}</p>
                          {step.detail && (
                            <p className="text-stone-500">{step.detail}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                  {activeTask.artifact && (
                    <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-stone-50 p-3 text-[11px] leading-relaxed text-stone-700 ring-1 ring-stone-200">
                      {activeTask.artifact}
                    </pre>
                  )}
                </div>
              ) : state.tasks[0] ? (
                <div className="rounded-xl border border-stone-200 bg-white/80 p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-stone-900">
                      {state.tasks[0].goal}
                    </p>
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      {state.tasks[0].status}
                    </Badge>
                  </div>
                  {state.tasks[0].artifact && (
                    <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-stone-50 p-3 text-[11px] leading-relaxed text-stone-700 ring-1 ring-stone-200">
                      {state.tasks[0].artifact}
                    </pre>
                  )}
                </div>
              ) : (
                <p className="px-1 py-8 text-center text-sm text-stone-500">
                  No active tasks yet. Give Dot a goal in chat.
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="memory" className="mt-0 min-h-0 flex-1">
          <div className="flex h-full min-h-0 flex-col p-3">
            <form
              className="mb-3 flex gap-2"
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
                placeholder="Add a preference Dot should remember…"
                className="h-9 rounded-lg bg-white text-sm"
              />
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-lg bg-teal-800 hover:bg-teal-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </form>
            <ScrollArea className="min-h-0 flex-1">
              <ul className="space-y-2 pr-2">
                {state.memory.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-xl border border-stone-200 bg-white/80 p-3"
                  >
                    <Badge
                      variant="outline"
                      className="mb-1.5 text-[10px] capitalize"
                    >
                      {note.kind}
                    </Badge>
                    <p className="text-sm text-stone-700">{note.text}</p>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full">
            <ul className="space-y-2 p-3">
              {state.activity.map((event) => (
                <li
                  key={event.id}
                  className="rounded-xl border border-stone-200/80 bg-white/70 px-3 py-2"
                >
                  <div className="mb-0.5 flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      {event.type}
                    </Badge>
                    <time className="text-[10px] text-stone-400">
                      {new Date(event.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </time>
                  </div>
                  <p className="text-xs text-stone-700">{event.text}</p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
