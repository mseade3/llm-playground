"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DotAvatar } from "@/components/dot-avatar";
import { RiverBackground } from "@/components/river-background";
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
  const [ownerName, setOwnerName] = useState("Miles Seade");
  const [tone, setTone] = useState<AvatarTone>("coral");
  const [connectGmail, setConnectGmail] = useState(true);
  const [connectYoutube, setConnectYoutube] = useState(false);
  const [connectCanvas, setConnectCanvas] = useState(true);
  const [connectGithub, setConnectGithub] = useState(true);
  const [busy, setBusy] = useState(false);

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <RiverBackground />

      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="mx-auto mb-4 grid h-7 w-7 grid-cols-3 gap-0.5 p-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "rounded-[1px]",
                i === 4 ? "bg-white" : "bg-neutral-600",
              )}
            />
          ))}
        </div>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500">
          OpenDots · Miles Seade
        </p>
        <h1 className="font-heading mt-3 text-[2.5rem] leading-[1.1] text-white md:text-5xl">
          Summer 2027 workspace
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-neutral-400">
          Specialist Dots for internship prep — deepen{" "}
          <span className="text-neutral-200">AADE</span>, research target roles,
          and ship application copy with review-before-save.
        </p>

        <div className="mx-auto mt-5 flex justify-center">
          <DotAvatar tone={tone} status="thinking" size="xl" />
        </div>

        <form
          className="mx-auto mt-6 max-w-sm space-y-4 text-left"
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
              ownerName: ownerName.trim() || "Miles Seade",
            }).finally(() => setBusy(false));
          }}
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">
              Your name
            </label>
            <Input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              maxLength={40}
              className="h-11 rounded-full border-neutral-800 bg-neutral-950/80 text-base text-neutral-100 placeholder:text-neutral-600"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">
              Primary Dot (researcher)
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="Scout"
              className="h-11 rounded-full border-neutral-800 bg-neutral-950/80 text-base text-neutral-100 placeholder:text-neutral-600"
            />
            <p className="mt-1.5 text-[11px] text-neutral-600">
              Quill (writer) and Relay (applications) join automatically.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-neutral-500">
              Look
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 transition",
                    tone === t.id
                      ? "border-neutral-500 bg-neutral-900"
                      : "border-neutral-800 bg-black/40 hover:border-neutral-700",
                  )}
                >
                  <DotAvatar tone={t.id} size="sm" />
                  <span className="text-[11px] text-neutral-500">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-neutral-500">
              Start with these plugins
            </label>
            <div className="space-y-2">
              {(
                [
                  ["Canvas", connectCanvas, setConnectCanvas, "UMich · due dates"],
                  ["GitHub", connectGithub, setConnectGithub, "AADE · issues/PRs"],
                  ["Gmail", connectGmail, setConnectGmail, "recruiters · proactive"],
                  ["YouTube", connectYoutube, setConnectYoutube, "optional"],
                ] as const
              ).map(([label, checked, setChecked, hint]) => (
                <label
                  key={label}
                  className="flex cursor-pointer items-center justify-between rounded-2xl border border-neutral-800 bg-black/50 px-3 py-2.5 text-sm text-neutral-200"
                >
                  <span>
                    {label}{" "}
                    <span className="text-neutral-600">· {hint}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    className="h-4 w-4 accent-white"
                  />
                </label>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded-full bg-white text-sm font-medium text-black hover:bg-neutral-200"
          >
            {busy
              ? "Waking…"
              : `Enter internship workspace with ${name.trim() || "Scout"}`}
          </Button>
        </form>
      </div>
    </div>
  );
}
