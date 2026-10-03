"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { WorkspaceState } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SpaceWorkspace({
  state,
  onSelectPage,
}: {
  state: WorkspaceState;
  onSelectPage: (spaceId: string, pageId: string) => void;
}) {
  const space = state.spaces.find((s) => s.id === state.selectedSpaceId);
  const pages = state.pages.filter((p) => p.spaceId === state.selectedSpaceId);
  const page =
    pages.find((p) => p.id === state.selectedPageId) ?? pages[0] ?? null;

  if (!space) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Select a Space
      </div>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-zinc-950/30">
      <header className="border-b border-zinc-800/80 px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Space
        </p>
        <h2 className="font-heading text-2xl text-zinc-50">{space.name}</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Pages Dots can save into after you approve.
        </p>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="border-b border-zinc-800/80 md:border-b-0 md:border-r">
          <ScrollArea className="h-full">
            <div className="space-y-1 p-3">
              {pages.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectPage(space.id, p.id)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                    page?.id === p.id
                      ? "bg-zinc-800 text-zinc-50"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200",
                  )}
                >
                  <p className="truncate font-medium">{p.title}</p>
                  <p className="mt-0.5 truncate text-[11px] text-zinc-600">
                    {p.savedByDotId
                      ? `Saved by ${state.dots.find((d) => d.id === p.savedByDotId)?.name ?? "Dot"}`
                      : p.editedBy
                        ? `Edited by ${p.editedBy}`
                        : "Draft"}
                  </p>
                </button>
              ))}
              {pages.length === 0 && (
                <p className="px-2 py-4 text-xs text-zinc-500">
                  No pages yet — approve a Dot draft to create one.
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        <ScrollArea className="h-full">
          <div className="px-6 py-6 md:px-8">
            {page ? (
              <>
                <h3 className="font-heading text-3xl text-zinc-50">
                  {page.title}
                </h3>
                <article className="prose-invert mt-6 max-w-none space-y-3 text-sm leading-relaxed text-zinc-300">
                  {page.body.split("\n").map((line, i) => {
                    if (line.startsWith("# ")) {
                      return (
                        <h1
                          key={i}
                          className="font-heading text-2xl text-zinc-50"
                        >
                          {line.slice(2)}
                        </h1>
                      );
                    }
                    if (line.startsWith("## ")) {
                      return (
                        <h2
                          key={i}
                          className="pt-2 text-base font-semibold text-zinc-100"
                        >
                          {line.slice(3)}
                        </h2>
                      );
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <p key={i} className="pl-3 text-zinc-400">
                          • {line.slice(2)}
                        </p>
                      );
                    }
                    if (!line.trim()) return <div key={i} className="h-2" />;
                    return <p key={i}>{line}</p>;
                  })}
                </article>
              </>
            ) : (
              <p className="text-sm text-zinc-500">Pick a page to read.</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </section>
  );
}
