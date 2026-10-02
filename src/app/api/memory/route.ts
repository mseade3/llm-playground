import { NextResponse } from "next/server";
import { addMemoryNote } from "@/lib/agent";
import { readState } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    kind?: "preference" | "decision" | "project" | "fact";
    text?: string;
  };

  if (!body.kind || !body.text?.trim()) {
    return NextResponse.json(
      { error: "kind and text are required." },
      { status: 400 },
    );
  }

  await addMemoryNote(body.kind, body.text.trim());
  const state = await readState();
  return NextResponse.json(state);
}
