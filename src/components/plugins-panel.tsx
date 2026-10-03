"use client";

import { Plug, RefreshCw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CATEGORY_LABELS, PLUGIN_CATALOG } from "@/lib/plugins/registry";
import type { PluginCategory } from "@/lib/plugins/types";
import type { WorkspaceState } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER: PluginCategory[] = [
  "school",
  "code",
  "money",
  "comms",
  "content",
  "ops",
];

export function PluginsPanel({
  state,
  onToggle,
  onSync,
  onToggleGoal,
}: {
  state: WorkspaceState;
  onToggle: (pluginId: string) => Promise<void>;
  onSync: (pluginId: string) => Promise<void>;
  onToggleGoal: (goalId: string, enabled: boolean) => Promise<void>;
}) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-3">
        <div>
          <p className="text-sm font-medium text-zinc-100">Plugin registry</p>
          <p className="mt-1 text-xs text-zinc-500">
            Connect life surfaces. Implemented plugins run in mock mode until
            you add API tokens — then they flip to live automatically.
          </p>
        </div>

        {CATEGORY_ORDER.map((category) => {
          const defs = PLUGIN_CATALOG.filter((p) => p.category === category);
          if (!defs.length) return null;
          return (
            <div key={category} className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                {CATEGORY_LABELS[category]}
              </p>
              {defs.map((def) => {
                const conn = state.plugins.find((p) => p.id === def.id);
                const connected = Boolean(conn?.connected);
                const goals = state.standingGoals.filter(
                  (g) => g.pluginId === def.id,
                );
                return (
                  <div
                    key={def.id}
                    className={cn(
                      "rounded-xl border p-3",
                      connected
                        ? "border-teal-500/30 bg-teal-500/5"
                        : "border-zinc-800 bg-zinc-900/60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-sm font-medium text-zinc-100">
                            {def.name}
                          </p>
                          {!def.implemented && (
                            <Badge variant="outline" className="text-[10px]">
                              soon
                            </Badge>
                          )}
                          {connected && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] uppercase"
                            >
                              {conn?.mode === "live" ? "live" : "mock"}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {def.description}
                        </p>
                        {conn?.lastSyncSummary && (
                          <p className="mt-1 text-[11px] text-teal-200/80">
                            Last sync: {conn.lastSyncSummary}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <Button
                          size="sm"
                          disabled={!def.implemented && !connected}
                          className={cn(
                            "h-8 rounded-lg text-xs",
                            connected
                              ? "border border-zinc-600 bg-transparent text-zinc-200 hover:bg-zinc-800"
                              : "bg-teal-500 text-zinc-950 hover:bg-teal-400",
                          )}
                          onClick={() => void onToggle(def.id)}
                        >
                          <Plug className="mr-1 h-3.5 w-3.5" />
                          {connected ? "Disconnect" : "Connect"}
                        </Button>
                        {connected && def.implemented && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-lg border-zinc-700 text-xs"
                            onClick={() => void onSync(def.id)}
                          >
                            <RefreshCw className="mr-1 h-3.5 w-3.5" />
                            Sync
                          </Button>
                        )}
                      </div>
                    </div>

                    {goals.length > 0 && (
                      <div className="mt-3 space-y-1.5 border-t border-zinc-800 pt-2">
                        <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-500">
                          <Sparkles className="h-3 w-3" />
                          Standing goals
                        </p>
                        {goals.map((goal) => (
                          <label
                            key={goal.id}
                            className="flex cursor-pointer items-start justify-between gap-2 rounded-lg bg-zinc-950/50 px-2 py-1.5"
                          >
                            <span>
                              <span className="block text-xs text-zinc-200">
                                {goal.title}
                              </span>
                              <span className="text-[10px] text-zinc-500">
                                {goal.cadence}
                              </span>
                            </span>
                            <input
                              type="checkbox"
                              className="mt-0.5 accent-teal-500"
                              checked={Boolean(goal.enabled && connected)}
                              disabled={!connected}
                              onChange={(e) =>
                                void onToggleGoal(goal.id, e.target.checked)
                              }
                            />
                          </label>
                        ))}
                      </div>
                    )}

                    {def.envKeys?.length ? (
                      <p className="mt-2 text-[10px] text-zinc-600">
                        Live env: {def.envKeys.join(", ")}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
