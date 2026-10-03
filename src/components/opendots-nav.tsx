"use client";

import {
  Brain,
  FolderOpen,
  Plug,
  Search,
  Settings2,
} from "lucide-react";
import { DotAvatar } from "@/components/dot-avatar";
import type { SpecialistDot, WorkspaceState } from "@/lib/types";
import { toneToAvatar } from "@/lib/opendots/client-tone";
import { cn } from "@/lib/utils";

function formatTime(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function DotRow({
  dot,
  active,
  onClick,
}: {
  dot: SpecialistDot;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition",
        active
          ? "bg-neutral-800/90"
          : "hover:bg-neutral-900/70",
      )}
    >
      <DotAvatar
        tone={toneToAvatar(dot.tone)}
        status={active ? "working" : "idle"}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium text-zinc-100">
            {dot.name}
          </p>
          <span className="shrink-0 text-[10px] text-zinc-500">
            {formatTime(dot.lastActivityAt)}
          </span>
        </div>
        <p className="truncate text-[11px] text-zinc-500">
          {dot.lastActivity ?? dot.role}
        </p>
      </div>
    </button>
  );
}

export function OpenDotsNav({
  state,
  onSelectDot,
  onSelectSpace,
  onSetView,
}: {
  state: WorkspaceState;
  onSelectDot: (dotId: string) => void;
  onSelectSpace: (spaceId: string) => void;
  onSetView: (view: WorkspaceState["view"]) => void;
}) {
  const pageCount = (spaceId: string) =>
    state.pages.filter((p) => p.spaceId === spaceId).length;

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-neutral-800/60 bg-black/55 backdrop-blur-md">
      <div className="flex items-center gap-2 border-b border-neutral-800/60 px-3 py-3">
        <div className="grid h-7 w-7 grid-cols-3 gap-0.5 p-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "rounded-[1px]",
                i === 4 ? "bg-white" : "bg-neutral-600",
              )}
            />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-lg leading-none text-white">
            OpenDots
          </p>
          <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.14em] text-neutral-500">
            Summer 2027 · Miles
          </p>
        </div>
      </div>

      <div className="px-3 pt-3">
        <div className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/70 px-2.5 py-1.5 text-xs text-neutral-500">
          <Search className="h-3.5 w-3.5" />
          <span>Start searching</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
        <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-600">
          Spaces
        </p>
        <div className="space-y-0.5">
          {state.spaces.map((space) => {
            const active =
              state.view === "space" && state.selectedSpaceId === space.id;
            return (
              <button
                key={space.id}
                type="button"
                onClick={() => onSelectSpace(space.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition",
                  active
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200",
                )}
              >
                <FolderOpen className="h-3.5 w-3.5 text-neutral-600" />
                <span className="flex-1 truncate">{space.name}</span>
                <span className="text-[11px] text-neutral-700">
                  {pageCount(space.id)}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mb-1.5 mt-5 px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-600">
          Dots
        </p>
        <div className="space-y-0.5">
          {state.dots.map((dot) => (
            <DotRow
              key={dot.id}
              dot={dot}
              active={
                state.view === "chat" && state.selectedDotId === dot.id
              }
              onClick={() => onSelectDot(dot.id)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-0.5 border-t border-neutral-800/60 p-2">
        <button
          type="button"
          onClick={() => onSetView("memory")}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200",
            state.view === "memory" && "bg-neutral-900 text-neutral-100",
          )}
        >
          <Brain className="h-3.5 w-3.5" />
          Memory
        </button>
        <button
          type="button"
          onClick={() => onSetView("plugins")}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200",
            state.view === "plugins" && "bg-neutral-900 text-neutral-100",
          )}
        >
          <Plug className="h-3.5 w-3.5" />
          Plugins
        </button>
        <button
          type="button"
          onClick={() => onSetView("settings")}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200",
            state.view === "settings" && "bg-neutral-900 text-neutral-100",
          )}
        >
          <Settings2 className="h-3.5 w-3.5" />
          Settings
        </button>
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-[11px] font-medium text-neutral-300">
            {state.ownerName
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-neutral-200">{state.ownerName}</p>
            <p className="text-[10px] text-neutral-600">Owner</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
