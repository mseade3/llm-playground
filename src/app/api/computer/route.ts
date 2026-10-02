import { NextResponse } from "next/server";
import { setComputerMode } from "@/lib/agent";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { mode?: "agent" | "user" };
  if (body.mode !== "agent" && body.mode !== "user") {
    return NextResponse.json({ error: "mode must be agent or user." }, { status: 400 });
  }

  const state = await setComputerMode(body.mode);
  return NextResponse.json(state);
}
