"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  FileText,
  Globe,
  Phone,
  ScreenShare,
  Terminal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DotAvatar } from "@/components/dot-avatar";
import { toneToAvatar } from "@/lib/opendots/client-tone";
import type {
  InlineAction,
  Message,
  ReviewCard,
  SpecialistDot,
  WorkspaceState,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Open Acme's Agents SDK announcement, summarize what they shipped, and save notes I can use in the launch brief.",
  "Check Canvas for what's due in the next 48 hours.",
  "Triage my GitHub issues and propose behind-the-scenes fixes.",
];

function renderContent(content: string) {
  return content.split("\n").map((line, i) => (
    <p key={i} className={cn(i > 0 && "mt-2", "whitespace-pre-wrap")}>
      {line.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={j} className="font-semibold text-zinc-50">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={j}
              className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-[12px] text-teal-200"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return (
            <em key={j} className="text-zinc-300">
              {part.slice(1, -1)}
            </em>
          );
        }
        return <span key={j}>{part}</span>;
      })}
    </p>
  ));
}

function ActionCard({ action }: { action: InlineAction }) {
  if (action.kind === "browser") {
    return (
      <div className="mt-2 overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-950/80">
        <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-1.5 text-[11px] text-zinc-400">
          <Globe className="h-3 w-3" />
          <span className="truncate">{action.url}</span>
          {action.live && (
            <span className="ml-auto flex items-center gap-1 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
          )}
        </div>
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 px-3 py-3">
          <p className="text-xs font-medium text-zinc-200">{action.title}</p>
          {action.preview && (
            <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-[11px] leading-relaxed text-zinc-500">
              {action.preview}
            </p>
          )}
        </div>
      </div>
    );
  }
  if (action.kind === "file") {
    return (
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-300">
        <FileText className="h-3.5 w-3.5 text-teal-300" />
        <span className="font-mono text-[11px]">{action.path}</span>
        <span className="ml-auto text-zinc-500">{action.sizeLabel}</span>
      </div>
    );
  }
  return (
    <div className="mt-2 rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-3 py-2 font-mono text-[11px]">
      <div className="flex items-center gap-2 text-zinc-400">
        <Terminal className="h-3 w-3" />
        <span>$ {action.command}</span>
      </div>
      <p className="mt-1 text-teal-200/90">{action.output}</p>
    </div>
  );
}

function ReviewCardView({
  review,
  onApprove,
  onDecline,
}: {
  review: ReviewCard;
  onApprove: () => void;
  onDecline: () => void;
}) {
  const approved = review.status === "approved";
  const declined = review.status === "declined";
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900/90 shadow-lg shadow-black/20">
      <div className="border-b border-zinc-800 px-4 py-3">
        <p className="text-sm font-medium text-zinc-100">{review.title}</p>
        {approved && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
            <Check className="h-3 w-3" />
            Approved · saved to {review.targetSpaceName}
          </p>
        )}
        {declined && (
          <p className="mt-1 text-xs text-rose-300">Declined — not saved</p>
        )}
      </div>
      <div className="px-4 py-3">
        <p className="text-sm leading-relaxed text-zinc-300">{review.summary}</p>
      </div>
      {review.status === "pending" && (
        <div className="flex gap-2 border-t border-zinc-800 px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-zinc-100"
            onClick={onDecline}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Decline
          </Button>
          <Button
            size="sm"
            className="ml-auto bg-teal-500 text-zinc-950 hover:bg-teal-400"
            onClick={onApprove}
          >
            <Check className="mr-1 h-3.5 w-3.5" />
            Approve &amp; save
          </Button>
        </div>
      )}
    </div>
  );
}

export function OpenDotsChat({
  state,
  dot,
  sending,
  onSend,
  onApprove,
  onReject,
}: {
  state: WorkspaceState;
  dot: SpecialistDot | undefined;
  sending: boolean;
  onSend: (message: string) => Promise<void>;
  onApprove: (approvalId: string) => Promise<void>;
  onReject: (approvalId: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const messages = state.messages.filter(
    (m) => !dot || !m.dotId || m.dotId === dot.id,
  );
  const computerRunning =
    state.computer.status === "running" ||
    state.computer.status === "working" ||
    state.agentStatus === "working";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, state.reviews.length, sending]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setDraft("");
    await onSend(text);
  }

  function reviewFor(message: Message): ReviewCard | undefined {
    if (!message.reviewId) return undefined;
    return state.reviews.find((r) => r.id === message.reviewId);
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-zinc-950/30">
      <header className="flex items-center justify-between gap-3 border-b border-zinc-800/80 px-4 py-3 md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          {dot && (
            <DotAvatar
              tone={toneToAvatar(dot.tone)}
              status={state.agentStatus}
              size="md"
            />
          )}
          <div className="min-w-0">
            <h2 className="truncate font-heading text-xl text-zinc-50">
              {dot?.name ?? "Dot"}
              <span className="ml-2 font-sans text-sm font-normal text-zinc-500">
                ({dot?.role ?? "Agent"}
                {computerRunning ? " · computer running" : ""})
              </span>
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-200"
            title="Call"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-200"
            title="Share screen"
          >
            <ScreenShare className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <ScrollArea className="flex-1 px-4 md:px-5">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 py-5">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-800 px-4 py-8 text-center">
              <p className="font-heading text-2xl text-zinc-100">
                Ask {dot?.name ?? "your Dot"}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Browse, save files, run shell — then review before saving to a
                Space.
              </p>
            </div>
          )}

          {messages.map((message) => {
            const review = reviewFor(message);
            const approval = review?.approvalId
              ? state.approvals.find((a) => a.id === review.approvalId)
              : undefined;
            return (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    message.role === "user"
                      ? "bg-teal-500/15 text-teal-50 ring-1 ring-teal-500/30"
                      : "bg-zinc-900/80 text-zinc-200 ring-1 ring-zinc-800",
                  )}
                >
                  {renderContent(message.content)}
                  {message.actions?.map((action) => (
                    <ActionCard key={action.id} action={action} />
                  ))}
                  {review && (
                    <ReviewCardView
                      review={review}
                      onApprove={() => {
                        if (approval) void onApprove(approval.id);
                      }}
                      onDecline={() => {
                        if (approval) void onReject(approval.id);
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="text-xs text-zinc-500">Thinking…</div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-zinc-800/80 px-4 py-3 md:px-5">
        {messages.length < 2 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void onSend(s)}
                className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-left text-[11px] text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"
              >
                {s.length > 64 ? `${s.slice(0, 64)}…` : s}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-2"
        >
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="+ Ask anything"
            rows={1}
            className="min-h-[40px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm text-zinc-100 shadow-none focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!draft.trim() || sending}
            className="h-9 w-9 shrink-0 rounded-xl bg-teal-500 p-0 text-zinc-950 hover:bg-teal-400"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </section>
  );
}
