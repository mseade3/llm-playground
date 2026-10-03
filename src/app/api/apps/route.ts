import { NextResponse } from "next/server";
import { toggleApp } from "@/lib/agent";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { appId?: string };
  if (!body.appId) {
    return NextResponse.json({ error: "appId is required." }, { status: 400 });
  }
  const state = await toggleApp(body.appId);
  return NextResponse.json(state);
}
