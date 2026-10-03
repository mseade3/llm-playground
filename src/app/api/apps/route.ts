import { NextResponse } from "next/server";
import { setPluginConnected } from "@/lib/agent";

export const dynamic = "force-dynamic";

/** Legacy toggle endpoint — forwards to plugin registry */
export async function POST(request: Request) {
  const body = (await request.json()) as { appId?: string };
  if (!body.appId) {
    return NextResponse.json({ error: "appId is required." }, { status: 400 });
  }
  const state = await setPluginConnected(body.appId);
  return NextResponse.json(state);
}
