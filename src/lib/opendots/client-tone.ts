import type { AvatarTone, SpecialistDot } from "@/lib/types";

export function toneToAvatar(tone: SpecialistDot["tone"]): AvatarTone {
  if (tone === "violet") return "violet";
  if (tone === "sky") return "sky";
  return tone;
}
