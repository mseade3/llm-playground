import { NextResponse } from "next/server";
import {
  setPluginConnected,
  setStandingGoalEnabled,
  syncPlugin,
} from "@/lib/agent";
import { PLUGIN_CATALOG, liveModeAvailable } from "@/lib/plugins/registry";
import { readState } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await readState();
  const catalog = PLUGIN_CATALOG.map((def) => {
    const connection = state.plugins.find((p) => p.id === def.id);
    return {
      ...def,
      connection,
      liveAvailable: liveModeAvailable(def),
      standingGoals: state.standingGoals.filter((g) => g.pluginId === def.id),
    };
  });
  return NextResponse.json({ catalog, plugins: state.plugins, state });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    action?: "connect" | "disconnect" | "toggle" | "sync" | "goal";
    pluginId?: string;
    syncAction?: string;
    goalId?: string;
    enabled?: boolean;
  };

  if (!body.action) {
    return NextResponse.json({ error: "action is required" }, { status: 400 });
  }

  if (body.action === "goal") {
    if (!body.goalId || typeof body.enabled !== "boolean") {
      return NextResponse.json(
        { error: "goalId and enabled are required" },
        { status: 400 },
      );
    }
    const state = await setStandingGoalEnabled(body.goalId, body.enabled);
    return NextResponse.json(state);
  }

  if (!body.pluginId) {
    return NextResponse.json({ error: "pluginId is required" }, { status: 400 });
  }

  if (body.action === "connect") {
    return NextResponse.json(await setPluginConnected(body.pluginId, true));
  }
  if (body.action === "disconnect") {
    return NextResponse.json(await setPluginConnected(body.pluginId, false));
  }
  if (body.action === "toggle") {
    return NextResponse.json(await setPluginConnected(body.pluginId));
  }
  if (body.action === "sync") {
    try {
      const { state, result } = await syncPlugin(
        body.pluginId,
        body.syncAction || "sync",
      );
      return NextResponse.json({ ...state, lastPluginResult: result });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Sync failed" },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
