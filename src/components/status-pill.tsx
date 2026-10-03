"use client";

import { cn } from "@/lib/utils";
import type { WorkspaceState } from "@/lib/types";

const LABELS: Record<WorkspaceState["agentStatus"], string> = {
  idle: "Standing by",
  thinking: "Thinking",
  working: "Working",
  waiting: "Needs you",
  paused: "Paused",
};

export function StatusPill({
  status,
}: {
  status: WorkspaceState["agentStatus"];
}) {
  const live = status === "working" || status === "thinking";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium tracking-wide",
        status === "waiting" && "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30",
        status === "paused" && "bg-zinc-700/60 text-zinc-300 ring-1 ring-zinc-600",
        status === "idle" && "bg-teal-500/10 text-teal-200 ring-1 ring-teal-500/25",
        live && "bg-teal-500/15 text-teal-100 ring-1 ring-teal-400/30",
      )}
    >
      <span className="relative flex h-2 w-2">
        {live && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            status === "waiting" && "bg-amber-400",
            status === "paused" && "bg-zinc-400",
            (status === "idle" || live) && "bg-teal-400",
          )}
        />
      </span>
      {LABELS[status]}
    </span>
  );
}
