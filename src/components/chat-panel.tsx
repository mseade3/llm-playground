"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DotAvatar } from "@/components/dot-avatar";
import type { AvatarTone, Message, WorkspaceState } from "@/lib/types";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Review the AADE README metrics, draft portfolio talking points for Summer 2027 SWE internships, and save notes to Applications.",
  "Check Canvas for what's due in the next 48 hours.",
  "Triage my GitHub issues and propose behind-the-scenes fixes.",
];

function renderContent(content: string) {
  return content.split("\n").map((line, i) => (
    <p key={i} className={cn(i > 0 && "mt-2", "whitespace-pre-wrap")}>
      {line.split(/(\*\*[^*]+\*\*|_\([^)]+\)_)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={j} className="font-semibold text-zinc-50">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("_(") && part.endsWith(")_")) {
          return (
            <em key={j} className="text-zinc-500 not-italic">
              {part.slice(1, -1)}
            </em>
          );
        }
        return <span key={j}>{part}</span>;
      })}
    </p>
  ));
}

export function ChatPanel({
  messages,
  sending,
  agentName,
  avatarTone,
  agentStatus,
  onSend,
}: {
  messages: Message[];
  sending: boolean;
  agentName: string;
  avatarTone: AvatarTone;
  agentStatus: WorkspaceState["agentStatus"];
  onSend: (message: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");
  const [callNote, setCallNote] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sending]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setDraft("");
    await onSend(text);
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      <ScrollArea className="flex-1 px-4 md:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 py-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "animate-in fade-in slide-in-from-bottom-1 duration-300",
                message.role === "user" ? "self-end" : "self-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[92%] px-4 py-3 text-sm leading-relaxed md:max-w-[85%]",
                  message.role === "user"
                    ? "rounded-2xl rounded-br-md bg-teal-600 text-teal-50"
                    : "rounded-2xl rounded-bl-md bg-zinc-900/80 text-zinc-200 shadow-sm ring-1 ring-zinc-700/80",
                )}
              >
                {message.role === "assistant" && (
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-teal-300/90">
                    <DotAvatar
                      tone={avatarTone}
                      size="sm"
                      className="!h-5 !w-5"
                    />
                    {agentName}
                  </div>
                )}
                {renderContent(message.content)}
              </div>
            </div>
          ))}
          {sending && (
            <div className="self-start rounded-2xl rounded-bl-md bg-zinc-900/80 px-4 py-3 text-sm text-zinc-400 shadow-sm ring-1 ring-zinc-700/80">
              {agentName} is picking up the thread…
            </div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-zinc-800 bg-zinc-950/70 px-4 py-4 backdrop-blur md:px-6">
        <div className="mx-auto max-w-2xl">
          {messages.length <= 1 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void onSend(s)}
                  className="rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1.5 text-left text-xs text-zinc-300 transition hover:border-teal-500/50 hover:text-teal-200"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {callNote && (
            <p className="mb-2 rounded-lg bg-teal-500/10 px-3 py-2 text-xs text-teal-100 ring-1 ring-teal-500/25">
              {callNote}
            </p>
          )}
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Hand ${agentName} a goal…`}
              rows={2}
              className="min-h-[72px] resize-none rounded-2xl border-zinc-700 bg-zinc-900 pr-24 text-sm text-zinc-100 shadow-sm placeholder:text-zinc-500"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit(e);
                }
              }}
            />
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-9 w-9 rounded-xl border-zinc-700 bg-zinc-900"
                title={`Call ${agentName}`}
                onClick={() => {
                  setCallNote(
                    `Voice call stub — talk through direction in chat the same way you'd coach ${agentName} on a call.`,
                  );
                  window.setTimeout(() => setCallNote(null), 4200);
                }}
              >
                <Phone className="h-4 w-4 text-teal-300" />
              </Button>
              <Button
                type="submit"
                size="icon"
                disabled={!draft.trim() || sending}
                className="h-9 w-9 rounded-xl bg-teal-500 text-zinc-950 hover:bg-teal-400"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </form>
          <p className="mt-2 text-[11px] text-zinc-500">
            Status: {agentStatus.replace("_", " ")} · orchestrates threads ·
            proactive when plugins allow
          </p>
        </div>
      </div>
    </section>
  );
}
