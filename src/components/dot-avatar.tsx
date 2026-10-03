"use client";

import { cn } from "@/lib/utils";
import type { AvatarTone, WorkspaceState } from "@/lib/types";

const TONE_CLASSES: Record<
  AvatarTone,
  { orb: string; glow: string; eye: string }
> = {
  teal: {
    orb: "from-teal-400 via-teal-600 to-teal-900",
    glow: "bg-teal-400/40",
    eye: "bg-teal-50",
  },
  coral: {
    orb: "from-rose-300 via-orange-500 to-rose-700",
    glow: "bg-orange-400/40",
    eye: "bg-orange-50",
  },
  indigo: {
    orb: "from-sky-300 via-indigo-500 to-indigo-900",
    glow: "bg-indigo-400/40",
    eye: "bg-indigo-50",
  },
  amber: {
    orb: "from-amber-200 via-amber-500 to-amber-800",
    glow: "bg-amber-400/40",
    eye: "bg-amber-50",
  },
  violet: {
    orb: "from-fuchsia-300 via-violet-500 to-violet-900",
    glow: "bg-violet-400/40",
    eye: "bg-violet-50",
  },
  sky: {
    orb: "from-sky-200 via-sky-500 to-blue-800",
    glow: "bg-sky-400/40",
    eye: "bg-sky-50",
  },
};

export function DotAvatar({
  tone,
  status,
  size = "md",
  className,
}: {
  tone: AvatarTone;
  status?: WorkspaceState["agentStatus"];
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const palette = TONE_CLASSES[tone];
  const live = status === "working" || status === "thinking";
  const waiting = status === "waiting";
  const sizeClass =
    size === "sm"
      ? "h-8 w-8"
      : size === "lg"
        ? "h-16 w-16"
        : size === "xl"
          ? "h-24 w-24"
          : "h-10 w-10";

  return (
    <div className={cn("relative shrink-0", sizeClass, className)}>
      {(live || waiting) && (
        <span
          className={cn(
            "absolute inset-[-18%] rounded-full blur-md",
            palette.glow,
            live && "animate-pulse",
            waiting && "bg-amber-400/35",
          )}
        />
      )}
      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br shadow-lg",
          palette.orb,
          live && "animate-[dot-bob_1.8s_ease-in-out_infinite]",
        )}
      >
        <div className="flex translate-y-[-6%] items-center gap-[18%]">
          <span
            className={cn(
              "block rounded-full",
              palette.eye,
              size === "xl" ? "h-2.5 w-2.5" : size === "lg" ? "h-2 w-2" : "h-1.5 w-1.5",
              waiting && "animate-pulse",
            )}
          />
          <span
            className={cn(
              "block rounded-full",
              palette.eye,
              size === "xl" ? "h-2.5 w-2.5" : size === "lg" ? "h-2 w-2" : "h-1.5 w-1.5",
              waiting && "animate-pulse",
            )}
          />
        </div>
        <span
          className={cn(
            "absolute rounded-full bg-white/25",
            size === "xl"
              ? "left-4 top-3 h-4 w-6"
              : size === "lg"
                ? "left-3 top-2.5 h-3 w-5"
                : "left-2 top-1.5 h-2 w-3",
          )}
        />
      </div>
    </div>
  );
}
