import { randomUUID } from "crypto";
import { addMessage, updateState } from "../store";
import type {
  InlineAction,
  ReviewCard,
  Task,
  TaskStep,
  WorkspaceState,
} from "../types";

export function toneToAvatar(
  tone: WorkspaceState["dots"][number]["tone"],
): WorkspaceState["avatarTone"] {
  if (tone === "violet") return "violet";
  if (tone === "sky") return "sky";
  return tone;
}

export async function applyStepSideEffects(
  task: Task,
  step: TaskStep,
): Promise<InlineAction | undefined> {
  const actions: InlineAction[] = [];

  await updateState((state) => {
    if (step.browse) {
      state.computer.activeView = "browser";
      state.computer.status = "running";
      state.computer.tabs = state.computer.tabs.map((t) => ({
        ...t,
        active: false,
      }));
      state.computer.tabs.unshift({
        id: randomUUID(),
        title: step.browse.title,
        url: step.browse.url,
        content: step.browse.content,
        active: true,
      });
      state.computer.tabs = state.computer.tabs.slice(0, 6);
      actions.push({
        id: randomUUID(),
        kind: "browser",
        url: step.browse.url,
        title: step.browse.title,
        live: true,
        preview: step.browse.content.slice(0, 280),
      });
    }

    if (step.fileWrite) {
      state.computer.activeView = "files";
      const existing = state.computer.files.find(
        (f) => f.path === step.fileWrite!.path,
      );
      if (existing) {
        existing.content = step.fileWrite.content;
        existing.sizeLabel = step.fileWrite.sizeLabel;
        existing.updatedAt = new Date().toISOString();
      } else {
        state.computer.files.unshift({
          path: step.fileWrite.path,
          sizeLabel: step.fileWrite.sizeLabel,
          content: step.fileWrite.content,
          updatedAt: new Date().toISOString(),
        });
      }
      actions.push({
        id: randomUUID(),
        kind: "file",
        path: step.fileWrite.path,
        sizeLabel: step.fileWrite.sizeLabel,
      });
    }

    if (step.terminal) {
      state.computer.activeView = "terminal";
      state.computer.terminal.unshift({
        id: randomUUID(),
        command: step.terminal.command,
        output: step.terminal.output,
        createdAt: new Date().toISOString(),
      });
      state.computer.terminal = state.computer.terminal.slice(0, 40);
      actions.push({
        id: randomUUID(),
        kind: "terminal",
        command: step.terminal.command,
        output: step.terminal.output,
      });
    }

    if (step.inlineAction) {
      actions.push({ ...step.inlineAction, id: step.inlineAction.id || randomUUID() });
    }

    const dot = state.dots.find((d) => d.id === task.dotId);
    if (dot) {
      dot.lastActivity = step.title;
      dot.lastActivityAt = new Date().toISOString();
    }
  });

  if (actions.length) {
    await addMessage("assistant", step.detail ?? step.title, {
      taskId: task.id,
      dotId: task.dotId,
      actions,
    });
  }

  return actions[0];
}

export async function createReviewForStep(
  task: Task,
  step: TaskStep,
  approvalId: string,
): Promise<ReviewCard | null> {
  if (!step.review) return null;
  const review: ReviewCard = {
    id: randomUUID(),
    title: step.review.title,
    targetSpaceId: step.review.targetSpaceId,
    targetSpaceName: "",
    summary: step.review.summary,
    body: step.review.body,
    status: "pending",
    approvalId,
    createdAt: new Date().toISOString(),
    dotId: task.dotId,
  };

  await updateState((state) => {
    const space = state.spaces.find((s) => s.id === review.targetSpaceId);
    review.targetSpaceName = space?.name ?? "Launch";
    state.reviews.unshift(review);
    const approval = state.approvals.find((a) => a.id === approvalId);
    if (approval) approval.reviewId = review.id;
  });

  const message = await addMessage(
    "assistant",
    "Here's the draft. I'll save it once you approve.",
    {
      taskId: task.id,
      dotId: task.dotId,
      reviewId: review.id,
    },
  );

  await updateState((state) => {
    const r = state.reviews.find((x) => x.id === review.id);
    if (r) r.messageId = message.id;
  });

  return review;
}

export async function saveReviewToSpace(reviewId: string, approved: boolean) {
  await updateState((state) => {
    const review = state.reviews.find((r) => r.id === reviewId);
    if (!review) return;
    review.status = approved ? "approved" : "declined";
    if (!approved) return;

    const now = new Date().toISOString();
    const existing = state.pages.find(
      (p) =>
        p.spaceId === review.targetSpaceId &&
        p.title.toLowerCase() ===
          review.title.replace(/^Review before saving:\s*/i, "").toLowerCase(),
    );
    if (existing) {
      existing.body = review.body;
      existing.updatedAt = now;
      existing.savedByDotId = review.dotId;
    } else {
      state.pages.unshift({
        id: randomUUID(),
        spaceId: review.targetSpaceId,
        title: review.title.replace(/^Review before saving:\s*/i, ""),
        body: review.body,
        createdAt: now,
        updatedAt: now,
        savedByDotId: review.dotId,
      });
    }

    const dot = state.dots.find((d) => d.id === review.dotId);
    if (dot) {
      dot.lastActivity = `Saved '${review.title.slice(0, 28)}…'`;
      dot.lastActivityAt = now;
    }
  });
}
