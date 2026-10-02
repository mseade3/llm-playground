import { NextResponse } from "next/server";
import { readState, resetWorkspace } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await readState();
  return NextResponse.json(state);
}

export async function DELETE() {
  const state = await resetWorkspace();
  return NextResponse.json(state);
}
