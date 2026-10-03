"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DotAvatar } from "@/components/dot-avatar";
import type { AvatarTone } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONES: { id: AvatarTone; label: string }[] = [
  { id: "teal", label: "Teal" },
  { id: "coral", label: "Coral" },
  { id: "indigo", label: "Indigo" },
  { id: "amber", label: "Amber" },
];

export function Onboarding({
  onCreate,
}: {
  onCreate: (payload: {
    name: string;
    tone: AvatarTone;
    connectGmail: boolean;
    connectYoutube: boolean;
  }) => Promise<void>;
}) {
  const [name, setName] = useState("Winston");
  const [tone, setTone] = useState<AvatarTone>("teal");
  const [connectGmail, setConnectGmail] = useState(true);
  const [connectYoutube, setConnectYoutube] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,120,110,0.22)_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(30,40,38,0.9)_0%,_transparent_45%),linear-gradient(180deg,_#0b100f_0%,_#121816_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(120,200,180,0.12)_0.7px,transparent_0.7px)] [background-size:20px_20px]" />

      <div className="relative z-10 w-full max-w-lg text-center">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-teal-300/70">
          Create your Dot
        </p>
        <h1 className="font-heading mt-3 text-5xl tracking-tight text-zinc-50 md:text-6xl">
          Meet your always-on agent
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-400 md:text-base">
          Name it, connect apps, then orchestrate work from one chat — cloud
          computer, proactive inbox, and take-over when login hits.
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
              name: name.trim() || "Winston",
              tone,
              connectGmail,
              connectYoutube,
            }).finally(() => setBusy(false));
          }}
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="Winston"
              className="h-11 rounded-xl border-zinc-700 bg-zinc-900/80 text-base text-zinc-100"
            />
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
              Plugins
            </label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-700/80 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200">
                <span>
                  Gmail{" "}
                  <span className="text-zinc-500">· proactive inbox</span>
                </span>
                <input
                  type="checkbox"
                  checked={connectGmail}
                  onChange={(e) => setConnectGmail(e.target.checked)}
                  className="h-4 w-4 accent-teal-500"
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-700/80 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200">
                <span>
                  YouTube{" "}
                  <span className="text-zinc-500">· Studio analytics</span>
                </span>
                <input
                  type="checkbox"
                  checked={connectYoutube}
                  onChange={(e) => setConnectYoutube(e.target.checked)}
                  className="h-4 w-4 accent-teal-500"
                />
              </label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded-xl bg-teal-500 text-sm font-medium text-zinc-950 hover:bg-teal-400"
          >
            {busy ? "Waking…" : `Start with ${name.trim() || "Winston"}`}
          </Button>
        </form>
      </div>
    </div>
  );
}
