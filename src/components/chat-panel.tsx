"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Research three competitors for a neighborhood coffee shop and draft a one-page brief.",
  "Pull overdue invoices and draft polite follow-up emails.",
  "Build a product launch checklist I can reuse.",
];

function renderContent(content: string) {
  return content.split("\n").map((line, i) => (
    <p key={i} className={cn(i > 0 && "mt-2", "whitespace-pre-wrap")}>
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={j} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
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
  onSend,
}: {
  messages: Message[];
  sending: boolean;
  onSend: (message: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");
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
                    ? "rounded-2xl rounded-br-md bg-teal-800 text-teal-50"
                    : "rounded-2xl rounded-bl-md bg-white/80 text-stone-800 shadow-sm ring-1 ring-stone-200/80",
                )}
              >
                {message.role === "assistant" && (
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-teal-700">
                    <Sparkles className="h-3 w-3" />
                    Dot
                  </div>
                )}
                {renderContent(message.content)}
              </div>
            </div>
          ))}
          {sending && (
            <div className="self-start rounded-2xl rounded-bl-md bg-white/80 px-4 py-3 text-sm text-stone-500 shadow-sm ring-1 ring-stone-200/80">
              Dot is picking up the thread…
            </div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-stone-200/70 bg-white/60 px-4 py-4 backdrop-blur md:px-6">
        <div className="mx-auto max-w-2xl">
          {messages.length <= 1 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void onSend(s)}
                  className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 text-left text-xs text-stone-600 transition hover:border-teal-300 hover:text-teal-900"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Hand Dot a goal…"
              rows={2}
              className="min-h-[72px] resize-none rounded-2xl border-stone-200 bg-white pr-14 text-sm shadow-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!draft.trim() || sending}
              className="absolute bottom-3 right-3 h-9 w-9 rounded-xl bg-teal-800 text-white hover:bg-teal-700"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
