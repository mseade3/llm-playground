import { NextResponse } from "next/server";
import { createDot } from "@/lib/store";
import type { AvatarTone } from "@/lib/types";

export const dynamic = "force-dynamic";

const TONES: AvatarTone[] = ["teal", "coral", "indigo", "amber"];

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    avatarTone?: AvatarTone;
  };
  const tone = TONES.includes(body.avatarTone as AvatarTone)
    ? (body.avatarTone as AvatarTone)
    : "teal";
  const state = await createDot(body.name?.trim() || "Alfred", tone);
  return NextResponse.json(state);
}
