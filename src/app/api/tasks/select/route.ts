import { NextResponse } from "next/server";
import { selectTask } from "@/lib/agent";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { taskId?: string | null };
  const state = await selectTask(body.taskId ?? null);
  return NextResponse.json(state);
}
