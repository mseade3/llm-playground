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
        status === "waiting" && "bg-amber-100 text-amber-900",
        status === "paused" && "bg-stone-200 text-stone-700",
        status === "idle" && "bg-teal-50 text-teal-900",
        live && "bg-teal-100 text-teal-950",
      )}
    >
      <span className="relative flex h-2 w-2">
        {live && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-60" />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            status === "waiting" && "bg-amber-500",
            status === "paused" && "bg-stone-500",
            (status === "idle" || live) && "bg-teal-600",
          )}
        />
      </span>
      {LABELS[status]}
    </span>
  );
}
