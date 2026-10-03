import { NextResponse } from "next/server";
import { updateRule } from "@/lib/agent";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    ruleId?: string;
    mode?: "allow" | "ask" | "block";
  };
  if (!body.ruleId || !body.mode) {
    return NextResponse.json(
      { error: "ruleId and mode are required." },
      { status: 400 },
    );
  }
  const state = await updateRule(body.ruleId, body.mode);
  return NextResponse.json(state);
}
