import { NextResponse } from "next/server";
import { startGoal } from "@/lib/agent";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { message?: string };
  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const state = await startGoal(message);
  return NextResponse.json(state);
}
