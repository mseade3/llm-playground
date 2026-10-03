"use client";

import { FileText, Globe, Hand, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SpecialistDot, WorkspaceState } from "@/lib/types";
import { cn } from "@/lib/utils";

const PERM_LABEL: Record<string, string> = {
  browser: "Browser",
  files: "Files",
  shell: "Shell",
  memory: "Memory",
};

export function ComputerPanel({
  state,
  dot,
  onComputerMode,
  onResolveAuth,
  onTab,
}: {
  state: WorkspaceState;
  dot?: SpecialistDot;
  onComputerMode: (mode: "agent" | "user") => Promise<void>;
  onResolveAuth: () => Promise<void>;
  onTab: (tab: "browser" | "files" | "terminal") => void;
}) {
  const tab =
    state.computer.tabs.find((t) => t.active) ?? state.computer.tabs[0];
  const running =
    state.computer.status === "running" ||
    state.computer.status === "working";
  const auth = state.computer.authChallenge;
  const view = state.computer.activeView;

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-neutral-800/60 bg-black/45 backdrop-blur-md">
      <header className="flex items-center justify-between border-b border-neutral-800/60 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-zinc-100">Computer</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-500">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                running ? "bg-emerald-400" : "bg-zinc-600",
              )}
            />
            {running
              ? "Running"
              : state.computer.mode === "user"
                ? "You have control"
                : "Idle"}
          </p>
        </div>
      </header>

      <div className="flex gap-1 border-b border-zinc-800/80 px-2 pt-2">
        {(
          [
            ["browser", Globe, "Browser"],
            ["files", FileText, "Files"],
            ["terminal", Terminal, "Terminal"],
          ] as const
        ).map(([id, Icon, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onTab(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-t-lg px-2 py-2 text-xs transition",
              view === id
                ? "bg-zinc-900 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-3">
          {auth?.status === "pending" && (
            <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-3">
              <p className="text-sm font-medium text-amber-100">
                Auth needed — {auth.site}
              </p>
              <p className="mt-1 text-xs text-amber-100/70">{auth.message}</p>
              <Button
                size="sm"
                className="mt-3 bg-amber-400 text-zinc-950 hover:bg-amber-300"
                onClick={() => void onResolveAuth()}
              >
                I finished login
              </Button>
            </div>
          )}

          {view === "browser" && (
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80">
              <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-1.5 text-[11px] text-zinc-500">
                <span className="truncate">{tab?.url ?? "about:blank"}</span>
                {running && (
                  <span className="ml-auto flex items-center gap-1 text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Live
                  </span>
                )}
              </div>
              <div className="min-h-[220px] bg-[radial-gradient(ellipse_at_top,_rgba(45,120,110,0.12),_transparent_55%),linear-gradient(180deg,#121816,#0c100f)] px-4 py-4">
                <p className="text-sm font-medium text-zinc-100">
                  {tab?.title ?? "Browser"}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-zinc-400">
                  {tab?.content || "No page open yet."}
                </p>
              </div>
            </div>
          )}

          {view === "files" && (
            <div className="space-y-2">
              {state.computer.files.length === 0 && (
                <p className="text-xs text-zinc-500">No files yet.</p>
              )}
              {state.computer.files.map((file) => (
                <div
                  key={file.path}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-teal-300" />
                    <span className="truncate font-mono text-[11px] text-zinc-200">
                      {file.path}
                    </span>
                    <span className="ml-auto text-[10px] text-zinc-500">
                      {file.sizeLabel}
                    </span>
                  </div>
                  {file.content && (
                    <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-zinc-500">
                      {file.content}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}

          {view === "terminal" && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 font-mono text-[11px]">
              {state.computer.terminal.length === 0 && (
                <p className="text-zinc-600">$ _</p>
              )}
              {[...state.computer.terminal].reverse().map((line) => (
                <div key={line.id} className="mb-3 last:mb-0">
                  <p className="text-zinc-400">$ {line.command}</p>
                  <p className="mt-0.5 whitespace-pre-wrap text-teal-200/90">
                    {line.output}
                  </p>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-[11px] leading-relaxed text-zinc-500">
            {dot?.name ?? "This Dot"}&apos;s browser profile and files persist
            across stop and start.
          </p>

          <Button
            variant="outline"
            className="mt-3 w-full border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:bg-zinc-800"
            onClick={() =>
              void onComputerMode(
                state.computer.mode === "user" ? "agent" : "user",
              )
            }
          >
            <Hand className="mr-2 h-3.5 w-3.5" />
            {state.computer.mode === "user" ? "Return control" : "Take over"}
          </Button>

          {dot && (
            <div className="mt-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Permissions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {dot.permissions.map((p) => (
                  <span
                    key={p}
                    className="rounded-md bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300 ring-1 ring-zinc-800"
                  >
                    {PERM_LABEL[p] ?? p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
