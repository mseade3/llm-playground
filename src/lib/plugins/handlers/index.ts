import { getPluginDef, liveModeAvailable } from "../registry";
import type { PluginActionResult, PluginConnection, PluginMode } from "../types";
import { runCanvasAction } from "./canvas";
import { runGithubAction } from "./github";

function resolveMode(connection: PluginConnection): PluginMode {
  const def = getPluginDef(connection.id);
  if (!def) return "mock";
  if (connection.mode === "live" && liveModeAvailable(def)) return "live";
  return "mock";
}

export async function runPluginAction(
  connection: PluginConnection,
  action: string,
): Promise<PluginActionResult> {
  const def = getPluginDef(connection.id);
  if (!def) {
    return {
      ok: false,
      mode: "mock",
      summary: "Unknown plugin",
      error: `No plugin registered for ${connection.id}`,
    };
  }
  if (!connection.connected) {
    return {
      ok: false,
      mode: "mock",
      summary: `${def.name} is not connected`,
      error: "Connect the plugin first",
    };
  }
  if (!def.implemented) {
    return {
      ok: false,
      mode: "mock",
      summary: `${def.name} is listed but not implemented yet`,
      error: "coming_soon",
    };
  }

  const mode = resolveMode(connection);

  switch (connection.id) {
    case "github":
      return runGithubAction(action, mode, connection.config);
    case "canvas":
      return runCanvasAction(action, mode);
    case "gmail":
      return {
        ok: true,
        mode: "mock",
        summary: "Inbox watch is active — proactive pings will use this plugin.",
        items: [
          {
            id: "mail-1",
            title: "SWE intern recruiter — follow-up",
            subtitle: "Needs reply · 12m ago",
          },
        ],
      };
    case "slack":
      return {
        ok: true,
        mode: "mock",
        summary: "Slack notify channel ready for decision alerts.",
      };
    case "youtube":
      return {
        ok: true,
        mode: "mock",
        summary: "YouTube Studio ready — ask Dot to analyze your last 10 videos.",
      };
    case "notion":
      return {
        ok: true,
        mode: "mock",
        summary: "Notion workspace ready for briefs and handoffs.",
      };
    default:
      return {
        ok: false,
        mode: "mock",
        summary: `No handler for ${def.name}`,
        error: "unhandled",
      };
  }
}
