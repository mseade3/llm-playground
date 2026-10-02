import { randomUUID } from "crypto";
import {
  addActivity,
  addMessage,
  readState,
  setAgentStatus,
  updateState,
  upsertMemory,
} from "./store";
import type {
  Approval,
  BrowserTab,
  Task,
  TaskStep,
  WorkspaceState,
} from "./types";

const runningTasks = new Set<string>();

type PlanSeed = {
  match: RegExp;
  goalLabel: string;
  memory?: { kind: "project" | "preference" | "fact"; text: string };
  steps: Array<{
    title: string;
    kind: TaskStep["kind"];
    detail: string;
    requiresApproval?: boolean;
    browse?: { title: string; url: string; content: string };
    result: string;
    durationMs: number;
  }>;
  artifact: string;
  reply: string;
};

const PLANS: PlanSeed[] = [
  {
    match: /coffee|cafe|café|competitor/i,
    goalLabel: "Coffee shop competitive brief",
    memory: {
      kind: "project",
      text: "Working on a neighborhood coffee shop competitive brief.",
    },
    steps: [
      {
        title: "Open research tabs",
        kind: "browse",
        detail: "Scanning local cafe reviews and menus.",
        browse: {
          title: "Local Cafe Landscape",
          url: "https://research.dot/local-cafes",
          content:
            "Top nearby cafes: Harbor Roast (specialty pour-over), Bean & Birch (all-day pastry), Metro Drip (commuter espresso). Common gaps: weekday midday seating, quiet work zones, and membership-style loyalty.",
        },
        result: "Opened three research tabs on local cafe positioning.",
        durationMs: 1400,
      },
      {
        title: "Compare positioning",
        kind: "analyze",
        detail: "Clustering price, vibe, and whitespace.",
        result:
          "Whitespace: calm weekday workspace + membership perks. Harbor Roast owns specialty; Metro Drip owns speed.",
        durationMs: 1600,
      },
      {
        title: "Draft one-page brief",
        kind: "draft",
        detail: "Writing a concise brief from findings.",
        result: "Drafted a one-page competitive brief with recommendations.",
        durationMs: 1800,
      },
      {
        title: "Save brief to workspace",
        kind: "write",
        detail: "Persist the finished brief as a project artifact.",
        requiresApproval: true,
        result: "Brief saved to workspace artifacts.",
        durationMs: 900,
      },
    ],
    artifact: `# Neighborhood Coffee Shop Brief

## Competitors
1. **Harbor Roast** — Specialty pour-over, higher price, weekend queues.
2. **Bean & Birch** — Pastry-led, warm but noisy, limited laptop etiquette.
3. **Metro Drip** — Fast espresso for commuters, thin midday offer.

## Opportunity
Own the **weekday focus cafe**: quieter seating, reliable Wi‑Fi, simple membership (coffee + reserved seat), and a midday lunch set that Metro Drip lacks.

## Next steps
- Mystery-shop Harbor Roast at 10am and 2pm.
- Price a monthly membership at $49–$69.
- Prototype a 3-item midday menu before lease negotiations.`,
    reply:
      "I'm on it — researching local cafe competitors and drafting a one-page brief. I'll keep working in the background and ask before I save anything.",
  },
  {
    match: /invoice|billing|accounts? payable/i,
    goalLabel: "Invoice follow-up pack",
    memory: {
      kind: "project",
      text: "Preparing overdue invoice follow-ups.",
    },
    steps: [
      {
        title: "Pull overdue invoices",
        kind: "research",
        detail: "Reading the sample receivables list.",
        browse: {
          title: "Receivables",
          url: "https://apps.dot/billing/overdue",
          content:
            "Overdue: Acme Studio $2,400 (12d), Northline Co $880 (21d), Bright Harbor $1,150 (7d). Prefer polite tone; escalate after 14 days.",
        },
        result: "Found 3 overdue invoices totaling $4,430.",
        durationMs: 1200,
      },
      {
        title: "Draft follow-up emails",
        kind: "draft",
        detail: "Writing polite reminders matched to aging.",
        result: "Prepared three follow-up drafts with escalation notes.",
        durationMs: 1700,
      },
      {
        title: "Queue emails for send",
        kind: "write",
        detail: "Queue outbound messages to contacts.",
        requiresApproval: true,
        result: "Follow-ups queued pending your approval.",
        durationMs: 800,
      },
    ],
    artifact: `# Invoice Follow-ups

**Acme Studio — $2,400 (12 days)**
Subject: Friendly nudge on invoice #1042
Body: Quick check-in on invoice #1042 for $2,400. Happy to resend the PDF or adjust payment details if needed.

**Northline Co — $880 (21 days)**
Subject: Overdue invoice #991 — please advise
Body: Invoice #991 is 21 days past due. Can you confirm status or a date we should expect payment?

**Bright Harbor — $1,150 (7 days)**
Subject: Invoice #1108 reminder
Body: Just a soft reminder that invoice #1108 for $1,150 came due last week.`,
    reply:
      "I'll gather the overdue invoices, draft follow-ups, and pause before anything is queued to send.",
  },
  {
    match: /launch|product|roadmap|changelog/i,
    goalLabel: "Launch checklist",
    memory: {
      kind: "project",
      text: "Building a product launch checklist.",
    },
    steps: [
      {
        title: "Collect launch inputs",
        kind: "research",
        detail: "Checking prior notes and common launch gaps.",
        result: "Collected messaging, channels, and readiness criteria.",
        durationMs: 1100,
      },
      {
        title: "Build checklist",
        kind: "draft",
        detail: "Turning inputs into an actionable checklist.",
        result: "Drafted a launch checklist with owners and gates.",
        durationMs: 1500,
      },
      {
        title: "Pin checklist to memory",
        kind: "memory",
        detail: "Save launch project preference for later sessions.",
        requiresApproval: true,
        result: "Launch checklist pinned for future sessions.",
        durationMs: 700,
      },
    ],
    artifact: `# Launch Checklist

- [ ] Positioning one-liner locked
- [ ] Landing page hero + CTA reviewed
- [ ] Changelog drafted
- [ ] Support macros ready
- [ ] Analytics events verified
- [ ] Soft launch to 10 friendly users
- [ ] Public announce pack (email, Slack, X)
- [ ] Day-1 triage owner assigned`,
    reply:
      "I'll assemble a launch checklist from your notes and pin it once you approve.",
  },
];

function genericPlan(goal: string): PlanSeed {
  return {
    match: /.*/,
    goalLabel: goal.slice(0, 80),
    memory: { kind: "project", text: `Active goal: ${goal.slice(0, 120)}` },
    steps: [
      {
        title: "Clarify the goal",
        kind: "analyze",
        detail: "Breaking the request into concrete work.",
        result: `Interpreted goal: ${goal}`,
        durationMs: 900,
      },
      {
        title: "Research context",
        kind: "browse",
        detail: "Gathering relevant background on the cloud computer.",
        browse: {
          title: "Research Scratchpad",
          url: "https://research.dot/scratch",
          content: `Working notes for: ${goal}\n\n- Identified stakeholders and constraints\n- Listed unknowns to resolve\n- Drafting a first pass deliverable`,
        },
        result: "Collected context and open questions.",
        durationMs: 1400,
      },
      {
        title: "Draft deliverable",
        kind: "draft",
        detail: "Producing a first useful artifact.",
        result: "First draft ready for review.",
        durationMs: 1600,
      },
      {
        title: "Save progress",
        kind: "write",
        detail: "Persist the artifact to the workspace.",
        requiresApproval: true,
        result: "Progress saved to the workspace.",
        durationMs: 800,
      },
    ],
    artifact: `# Progress Report

## Goal
${goal}

## What I did
- Clarified the ask into sequential steps
- Researched context on the cloud computer
- Drafted a first deliverable for your review

## Needs your judgment
Approve saving this progress so I can continue from here in later sessions.

## Suggested next moves
1. Confirm the desired outcome and audience
2. Point me at any source docs or constraints
3. Tell me what “done” looks like`,
    reply:
      "Got it. I'll break this into steps, work through them on my cloud computer, and check with you before saving anything lasting.",
  };
}

function pickPlan(goal: string): PlanSeed {
  return PLANS.find((p) => p.match.test(goal)) ?? genericPlan(goal);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function setComputerWorking(
  action: string,
  tab?: { title: string; url: string; content: string },
) {
  await updateState((state) => {
    state.computer.status = "working";
    state.computer.mode = "agent";
    state.computer.currentAction = action;
    state.computer.logs.unshift(action);
    state.computer.logs = state.computer.logs.slice(0, 40);
    if (tab) {
      const next: BrowserTab = {
        id: randomUUID(),
        title: tab.title,
        url: tab.url,
        content: tab.content,
        active: true,
      };
      state.computer.tabs = state.computer.tabs.map((t) => ({
        ...t,
        active: false,
      }));
      state.computer.tabs.unshift(next);
      state.computer.tabs = state.computer.tabs.slice(0, 6);
    }
  });
}

async function createApproval(
  task: Task,
  step: TaskStep,
): Promise<Approval> {
  const approval: Approval = {
    id: randomUUID(),
    taskId: task.id,
    stepId: step.id,
    title: step.title,
    summary: step.detail ?? step.title,
    action: step.result ?? "Proceed with write action",
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  await updateState((state) => {
    state.approvals.unshift(approval);
    state.agentStatus = "waiting";
    state.computer.status = "waiting";
    state.computer.currentAction = `Waiting for approval: ${step.title}`;
    const t = state.tasks.find((x) => x.id === task.id);
    if (t) {
      t.status = "waiting_approval";
      t.updatedAt = new Date().toISOString();
    }
  });
  await addActivity("approval", `Needs your approval: ${step.title}`, task.id);
  await addMessage(
    "assistant",
    `I need your go-ahead before I **${step.title.toLowerCase()}**.\n\n${step.detail ?? ""}\n\nApprove to continue, or reject and I'll stop there.`,
    task.id,
  );
  return approval;
}

async function finishTask(taskId: string, artifact: string) {
  await updateState((state) => {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;
    task.status = "completed";
    task.artifact = artifact;
    task.updatedAt = new Date().toISOString();
    state.agentStatus = state.tasks.some(
      (t) => t.status === "running" || t.status === "waiting_approval",
    )
      ? state.agentStatus
      : "idle";
    state.computer.status = "idle";
    state.computer.currentAction = "Standing by for the next goal.";
    state.computer.logs.unshift("Task completed.");
  });
  await addActivity("work", "Finished the current goal.", taskId);
  await addMessage(
    "assistant",
    "Done — the deliverable is ready in the task panel. I kept the useful bits in memory so we can continue later without restarting.",
    taskId,
  );
  await setAgentStatus((await readState()).agentStatus);
}

async function runTaskLoop(taskId: string, artifact: string) {
  if (runningTasks.has(taskId)) return;
  runningTasks.add(taskId);

  try {
    while (true) {
      const state = await readState();
      if (state.computer.mode === "user") {
        await setAgentStatus("paused");
        await sleep(800);
        continue;
      }

      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) break;
      if (
        task.status === "completed" ||
        task.status === "failed" ||
        task.status === "cancelled"
      ) {
        break;
      }
      if (task.status === "waiting_approval" || task.status === "paused") {
        await sleep(700);
        continue;
      }

      const step = task.steps[task.currentStepIndex];
      if (!step) {
        await finishTask(taskId, artifact);
        break;
      }

      await updateState((s) => {
        const t = s.tasks.find((x) => x.id === taskId);
        if (!t) return;
        t.status = "running";
        t.updatedAt = new Date().toISOString();
        const st = t.steps[t.currentStepIndex];
        if (st) st.status = "running";
        s.agentStatus = "working";
      });

      await addActivity("work", step.title, taskId);
      await setComputerWorking(step.detail ?? step.title, step.browse);
      await sleep(Math.max(600, step.durationMs ?? 1200));

      // Re-check takeover mid-step
      const mid = await readState();
      if (mid.computer.mode === "user") {
        await updateState((s) => {
          const t = s.tasks.find((x) => x.id === taskId);
          if (!t) return;
          t.status = "paused";
          const st = t.steps[t.currentStepIndex];
          if (st && st.status === "running") st.status = "pending";
          s.agentStatus = "paused";
        });
        continue;
      }

      if (step.requiresApproval) {
        const live = await readState();
        const liveTask = live.tasks.find((t) => t.id === taskId);
        const liveStep = liveTask?.steps[liveTask.currentStepIndex];
        if (liveTask && liveStep) {
          await createApproval(liveTask, liveStep);
        }
        continue;
      }

      await updateState((s) => {
        const t = s.tasks.find((x) => x.id === taskId);
        if (!t) return;
        const st = t.steps[t.currentStepIndex];
        if (st) {
          st.status = "done";
          st.result = step.result;
        }
        t.currentStepIndex += 1;
        t.updatedAt = new Date().toISOString();
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await updateState((s) => {
      const t = s.tasks.find((x) => x.id === taskId);
      if (!t) return;
      t.status = "failed";
      t.error = message;
      t.updatedAt = new Date().toISOString();
      s.agentStatus = "idle";
      s.computer.status = "idle";
    });
    await addActivity("error", `Task failed: ${message}`, taskId);
    await addMessage("assistant", `Something went wrong: ${message}`, taskId);
  } finally {
    runningTasks.delete(taskId);
  }
}

export async function startGoal(goal: string): Promise<WorkspaceState> {
  const plan = pickPlan(goal);
  const now = new Date().toISOString();

  const steps: TaskStep[] = plan.steps.map((s) => ({
    id: randomUUID(),
    title: s.title,
    kind: s.kind,
    status: "pending",
    detail: s.detail,
    requiresApproval: s.requiresApproval,
    result: s.result,
    durationMs: s.durationMs,
    browse: s.browse,
  }));

  const task: Task = {
    id: randomUUID(),
    goal: plan.goalLabel,
    status: "queued",
    steps,
    currentStepIndex: 0,
    createdAt: now,
    updatedAt: now,
    plannedArtifact: plan.artifact,
  };

  await updateState((state) => {
    state.tasks.unshift(task);
    state.agentStatus = "thinking";
  });

  await addMessage("user", goal, task.id);
  await addMessage("assistant", plan.reply, task.id);
  await addActivity("work", `Started: ${plan.goalLabel}`, task.id);

  if (plan.memory) {
    await upsertMemory(plan.memory.kind, plan.memory.text);
    await addActivity("memory", `Remembered: ${plan.memory.text}`, task.id);
  }

  // Fire and forget background work
  void runTaskLoop(task.id, plan.artifact);

  return readState();
}

export async function resumeTask(taskId: string) {
  const state = await readState();
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task || task.status === "completed") return;
  const artifact =
    task.plannedArtifact ??
    task.artifact ??
    `# Progress\n\nGoal: ${task.goal}\n\nCompleted steps:\n${task.steps
      .filter((s) => s.status === "done")
      .map((s) => `- ${s.title}`)
      .join("\n")}`;
  void runTaskLoop(taskId, artifact);
}

export async function resolveApproval(
  approvalId: string,
  decision: "approved" | "rejected",
): Promise<WorkspaceState> {
  let taskId: string | null = null;

  await updateState((state) => {
    const approval = state.approvals.find((a) => a.id === approvalId);
    if (!approval || approval.status !== "pending") return;
    approval.status = decision;
    taskId = approval.taskId;
    const task = state.tasks.find((t) => t.id === approval.taskId);
    if (!task) return;
    const step = task.steps.find((s) => s.id === approval.stepId);
    if (decision === "approved") {
      if (step) {
        step.status = "done";
        step.result = approval.action;
      }
      task.currentStepIndex += 1;
      task.status = "running";
      task.updatedAt = new Date().toISOString();
      state.agentStatus = "working";
      state.computer.status = "working";
      state.computer.currentAction = "Continuing after approval.";
    } else {
      if (step) step.status = "skipped";
      task.status = "cancelled";
      task.updatedAt = new Date().toISOString();
      state.agentStatus = "idle";
      state.computer.status = "idle";
      state.computer.currentAction = "Stopped after rejection.";
    }
  });

  if (taskId) {
    if (decision === "approved") {
      await addActivity("approval", "Approved — continuing work.", taskId);
      await addMessage(
        "assistant",
        "Approved. Picking up where I left off.",
        taskId,
      );
      await resumeTask(taskId);
    } else {
      await addActivity("approval", "Rejected — stopped that action.", taskId);
      await addMessage(
        "assistant",
        "Understood — I won't take that action. Tell me how you'd like to adjust.",
        taskId,
      );
    }
  }

  return readState();
}

export async function setComputerMode(
  mode: "agent" | "user",
): Promise<WorkspaceState> {
  await updateState((state) => {
    state.computer.mode = mode;
    if (mode === "user") {
      state.agentStatus = "paused";
      state.computer.status = "waiting";
      state.computer.currentAction = "You have control of the computer.";
      state.computer.logs.unshift("User took over the computer.");
      for (const task of state.tasks) {
        if (task.status === "running") {
          task.status = "paused";
          task.updatedAt = new Date().toISOString();
        }
      }
    } else {
      state.computer.logs.unshift("Control returned to Dot.");
      state.computer.currentAction = "Resuming work.";
      for (const task of state.tasks) {
        if (task.status === "paused") {
          task.status = "running";
          task.updatedAt = new Date().toISOString();
        }
      }
      state.agentStatus = state.tasks.some((t) => t.status === "running")
        ? "working"
        : state.tasks.some((t) => t.status === "waiting_approval")
          ? "waiting"
          : "idle";
      state.computer.status =
        state.agentStatus === "working" ? "working" : "idle";
    }
  });

  await addActivity(
    "handoff",
    mode === "user" ? "You took over the computer." : "Returned control to Dot.",
  );

  if (mode === "agent") {
    const state = await readState();
    for (const task of state.tasks) {
      if (task.status === "running") {
        await resumeTask(task.id);
      }
    }
  }

  return readState();
}

export async function addMemoryNote(
  kind: "preference" | "decision" | "project" | "fact",
  text: string,
) {
  const note = await upsertMemory(kind, text);
  await addActivity("memory", `Saved ${kind}: ${text}`);
  return note;
}
