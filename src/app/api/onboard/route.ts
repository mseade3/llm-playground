import { NextResponse } from "next/server";
import { createDot } from "@/lib/store";
import type { AvatarTone } from "@/lib/types";
import { ensureProactiveLoop } from "@/lib/agent";

export const dynamic = "force-dynamic";

const TONES: AvatarTone[] = ["teal", "coral", "indigo", "amber"];

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    avatarTone?: AvatarTone;
    connectGmail?: boolean;
    connectYoutube?: boolean;
    connectCanvas?: boolean;
    connectGithub?: boolean;
  };
  const tone = TONES.includes(body.avatarTone as AvatarTone)
    ? (body.avatarTone as AvatarTone)
    : "teal";
  const state = await createDot(body.name?.trim() || "Winston", tone, {
    connectGmail: body.connectGmail,
    connectYoutube: body.connectYoutube,
    connectCanvas: body.connectCanvas,
    connectGithub: body.connectGithub,
  });
  ensureProactiveLoop();
  return NextResponse.json(state);
}
