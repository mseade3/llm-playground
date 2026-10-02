import { NextResponse } from "next/server";
import { resolveApproval } from "@/lib/agent";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    approvalId?: string;
    decision?: "approved" | "rejected";
  };

  if (!body.approvalId || !body.decision) {
    return NextResponse.json(
      { error: "approvalId and decision are required." },
      { status: 400 },
    );
  }

  const state = await resolveApproval(body.approvalId, body.decision);
  return NextResponse.json(state);
}
