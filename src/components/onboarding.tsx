"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DotAvatar } from "@/components/dot-avatar";
import type { AvatarTone } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONES: { id: AvatarTone; label: string }[] = [
  { id: "coral", label: "Coral" },
  { id: "teal", label: "Teal" },
  { id: "violet", label: "Violet" },
  { id: "sky", label: "Sky" },
];

export function Onboarding({
  onCreate,
}: {
  onCreate: (payload: {
    name: string;
    tone: AvatarTone;
    connectGmail: boolean;
    connectYoutube: boolean;
    connectCanvas: boolean;
    connectGithub: boolean;
    ownerName?: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState("Scout");
  const [ownerName, setOwnerName] = useState("David McKay");
  const [tone, setTone] = useState<AvatarTone>("coral");
  const [connectGmail, setConnectGmail] = useState(true);
  const [connectYoutube, setConnectYoutube] = useState(false);
  const [connectCanvas, setConnectCanvas] = useState(true);
  const [connectGithub, setConnectGithub] = useState(true);
  const [busy, setBusy] = useState(false);

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,120,110,0.22)_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(30,40,38,0.9)_0%,_transparent_45%),linear-gradient(180deg,_#0b100f_0%,_#121816_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(120,200,180,0.12)_0.7px,transparent_0.7px)] [background-size:20px_20px]" />

      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="mx-auto mb-4 grid h-8 w-8 grid-cols-3 gap-0.5 p-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "rounded-[1px]",
                i === 4 ? "bg-teal-400" : "bg-zinc-500",
              )}
            />
          ))}
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-teal-300/70">
          OpenDots
        </p>
        <h1 className="font-heading mt-3 text-5xl tracking-tight text-zinc-50 md:text-6xl">
          Meet your Dots
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-400 md:text-base">
          Specialist agents with Spaces, a persistent computer, and
          review-before-save — inspired by{" "}
          <a
            href="https://www.copilotkit.ai/opendots"
            className="text-teal-300 underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            CopilotKit OpenDots
          </a>
          .
        </p>

        <div className="mx-auto mt-8 flex justify-center">
          <DotAvatar tone={tone} status="thinking" size="xl" />
        </div>

        <form
          className="mx-auto mt-8 max-w-sm space-y-5 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            setBusy(true);
            void onCreate({
              name: name.trim() || "Scout",
              tone,
              connectGmail,
              connectYoutube,
              connectCanvas,
              connectGithub,
              ownerName: ownerName.trim() || "David McKay",
            }).finally(() => setBusy(false));
          }}
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Your name
            </label>
            <Input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              maxLength={40}
              className="h-11 rounded-xl border-zinc-700 bg-zinc-900/80 text-base text-zinc-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Primary Dot (researcher)
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="Scout"
              className="h-11 rounded-xl border-zinc-700 bg-zinc-900/80 text-base text-zinc-100"
            />
            <p className="mt-1.5 text-[11px] text-zinc-500">
              Quill (writer) and Relay (comms) join automatically.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              Look
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border px-2 py-3 transition",
                    tone === t.id
                      ? "border-teal-400/60 bg-zinc-900 shadow-sm"
                      : "border-zinc-700/80 bg-zinc-900/40 hover:border-zinc-600",
                  )}
                >
                  <DotAvatar tone={t.id} size="sm" />
                  <span className="text-[11px] text-zinc-400">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              Start with these plugins
            </label>
            <div className="space-y-2">
              {(
                [
                  ["Canvas", connectCanvas, setConnectCanvas, "school · due dates"],
                  ["GitHub", connectGithub, setConnectGithub, "build · issues/PRs"],
                  ["Gmail", connectGmail, setConnectGmail, "comms · proactive"],
                  ["YouTube", connectYoutube, setConnectYoutube, "content · analytics"],
                ] as const
              ).map(([label, checked, setChecked, hint]) => (
                <label
                  key={label}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-700/80 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200"
                >
                  <span>
                    {label}{" "}
                    <span className="text-zinc-500">· {hint}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    className="h-4 w-4 accent-teal-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded-xl bg-teal-500 text-sm font-medium text-zinc-950 hover:bg-teal-400"
          >
            {busy ? "Waking…" : `Enter OpenDots with ${name.trim() || "Scout"}`}
          </Button>
        </form>
      </div>
    </div>
  );
}
