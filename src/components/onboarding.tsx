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
  onCreate: (name: string, tone: AvatarTone) => Promise<void>;
}) {
  const [name, setName] = useState("Alfred");
  const [tone, setTone] = useState<AvatarTone>("teal");
  const [busy, setBusy] = useState(false);

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#cfe8e4_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_right,_#e8dcc8_0%,_transparent_45%),linear-gradient(180deg,_#eef4f1_0%,_#e7e2d8_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(20,70,60,0.12)_0.7px,transparent_0.7px)] [background-size:20px_20px]" />

      <div className="relative z-10 w-full max-w-lg text-center">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-teal-800/70">
          Create your Dot
        </p>
        <h1 className="font-heading mt-3 text-5xl tracking-tight text-stone-900 md:text-6xl">
          Meet your always-on agent
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-stone-600 md:text-base">
          Name it, pick a face, then hand it projects. It works on a cloud
          computer between chats — and asks before opening PRs or sending mail.
        </p>

        <div className="mx-auto mt-8 flex justify-center">
          <DotAvatar tone={tone} status="thinking" size="xl" />
        </div>

        <form
          className="mx-auto mt-8 max-w-sm space-y-5 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            setBusy(true);
            void onCreate(name.trim() || "Alfred", tone).finally(() =>
              setBusy(false),
            );
          }}
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="Alfred"
              className="h-11 rounded-xl border-stone-200 bg-white/90 text-base"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-stone-600">
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
                      ? "border-teal-700 bg-white shadow-sm"
                      : "border-stone-200/80 bg-white/50 hover:border-stone-300",
                  )}
                >
                  <DotAvatar tone={t.id} size="sm" />
                  <span className="text-[11px] text-stone-600">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded-xl bg-teal-800 text-sm font-medium text-white hover:bg-teal-700"
          >
            {busy ? "Waking…" : `Start with ${name.trim() || "Alfred"}`}
          </Button>
        </form>
      </div>
    </div>
  );
}
