import { NextResponse } from "next/server";
import { ensureProactiveLoop } from "@/lib/agent";
import { readState, resetWorkspace } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  ensureProactiveLoop();
  const state = await readState();
  return NextResponse.json(state);
}

export async function DELETE() {
  const state = await resetWorkspace();
  return NextResponse.json(state);
}
