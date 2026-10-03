import { PLUGIN_CATALOG, liveModeAvailable } from "./registry";
import type { PluginConnection } from "./types";
import type { StandingGoal } from "../types";

export function defaultPluginConnections(): PluginConnection[] {
  return PLUGIN_CATALOG.map((def) => {
    const preferredConnected = ["github", "slack", "gmail"].includes(def.id);
    return {
      id: def.id,
      connected: def.implemented && preferredConnected,
      mode: liveModeAvailable(def) ? "live" : "mock",
      connectedAt: preferredConnected ? new Date().toISOString() : null,
      lastSyncAt: null,
      lastSyncSummary: null,
      config:
        def.id === "github"
          ? {
              owner: process.env.GITHUB_OWNER || "mseade3",
              repo: process.env.GITHUB_REPO || "Ann-Arbor-Automation",
            }
          : ({} as Record<string, string>),
    };
  });
}

export function defaultPluginStandingGoals(
  plugins: PluginConnection[],
): StandingGoal[] {
  const goals: StandingGoal[] = [];
  for (const def of PLUGIN_CATALOG) {
    const conn = plugins.find((p) => p.id === def.id);
    for (const g of def.defaultStandingGoals) {
      goals.push({
        id: g.id,
        title: g.title,
        cadence: g.cadence,
        pluginId: def.id,
        enabled: Boolean(conn?.connected),
        status: conn?.connected ? "watching" : "paused",
      });
    }
  }
  return goals;
}

export function mergePluginConnections(
  existing?: PluginConnection[] | null,
  legacyApps?: Array<{ id: string; connected: boolean }> | null,
): PluginConnection[] {
  const base = defaultPluginConnections();
  return base.map((plugin) => {
    const fromPlugins = existing?.find((p) => p.id === plugin.id);
    const fromApps = legacyApps?.find((a) => a.id === plugin.id);
    if (fromPlugins) {
      const def = PLUGIN_CATALOG.find((d) => d.id === plugin.id);
      const canLive = def ? liveModeAvailable(def) : false;
      return {
        ...plugin,
        ...fromPlugins,
        mode: canLive && fromPlugins.mode === "live" ? "live" : "mock",
      };
    }
    if (fromApps) {
      return {
        ...plugin,
        connected: fromApps.connected,
        connectedAt: fromApps.connected ? new Date().toISOString() : null,
      };
    }
    return plugin;
  });
}
