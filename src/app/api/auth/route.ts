import { NextResponse } from "next/server";
import { resolveAuthChallenge } from "@/lib/agent";

export const dynamic = "force-dynamic";

export async function POST() {
  const state = await resolveAuthChallenge();
  return NextResponse.json(state);
}
