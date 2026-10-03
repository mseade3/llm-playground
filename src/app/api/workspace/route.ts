import { NextResponse } from "next/server";
import { readState, updateState } from "@/lib/store";
import { toneToAvatar } from "@/lib/opendots/runtime";
import type { WorkspaceView } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    action?: "selectDot" | "selectSpace" | "selectPage" | "setView" | "computerTab";
    dotId?: string | null;
    spaceId?: string | null;
    pageId?: string | null;
    view?: WorkspaceView;
    tab?: "browser" | "files" | "terminal";
  };

  if (body.action === "selectDot" && body.dotId) {
    await updateState((state) => {
      const dot = state.dots.find((d) => d.id === body.dotId);
      if (!dot) return;
      state.selectedDotId = dot.id;
      state.agentName = dot.name;
      state.avatarTone = toneToAvatar(dot.tone);
      state.view = "chat";
      state.selectedSpaceId = null;
      state.selectedPageId = null;
    });
  } else if (body.action === "selectSpace") {
    await updateState((state) => {
      state.selectedSpaceId = body.spaceId ?? null;
      state.selectedPageId = null;
      state.view = body.spaceId ? "space" : "chat";
    });
  } else if (body.action === "selectPage") {
    await updateState((state) => {
      state.selectedPageId = body.pageId ?? null;
      if (body.spaceId) state.selectedSpaceId = body.spaceId;
      state.view = "space";
    });
  } else if (body.action === "setView" && body.view) {
    await updateState((state) => {
      state.view = body.view!;
      if (body.view !== "space") {
        state.selectedSpaceId = null;
        state.selectedPageId = null;
      }
    });
  } else if (body.action === "computerTab" && body.tab) {
    await updateState((state) => {
      state.computer.activeView = body.tab!;
    });
  } else {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  return NextResponse.json(await readState());
}
