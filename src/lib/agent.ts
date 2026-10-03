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
  PullRequest,
  Task,
  TaskStep,
  WorkspaceState,
} from "./types";

const runningTasks = new Set<string>();

type PlanSeed = {
  match: RegExp;
  goalLabel: string;
  threadLabel?: string;
  workerModel?: string;
  memory?: { kind: "project" | "preference" | "fact"; text: string };
  steps: Array<{
    title: string;
    kind: TaskStep["kind"];
    detail: string;
    requiresApproval?: boolean;
    browse?: { title: string; url: string; content: string };
    needsAuth?: { site: string; message: string };
    result: string;
    durationMs: number;
  }>;
  artifact: string;
  pullRequests?: Array<Omit<PullRequest, "id" | "taskId" | "createdAt">>;
  reply: (name: string) => string;
};

const PLANS: PlanSeed[] = [
  {
    match: /muse|grokbot|grok bot|comparison site|use cases|dots vs/i,
    goalLabel: "Build Dots comparison website",
    threadLabel: "Codex thread · dots project",
    workerModel: "Soul 6.1",
    memory: {
      kind: "project",
      text: "Building a Dots vs Muse vs Grokbot comparison site.",
    },
    steps: [
      {
        title: "Spin up Codex worker thread",
        kind: "code",
        detail: "Orchestrating a Soul 6.1 thread inside the dots project.",
        browse: {
          title: "codex · dots / comparison-site",
          url: "codex://threads/dots-comparison",
          content:
            "Worker: Soul 6.1 (high)\nOrchestrator: Astra via Dot\nBrief: local site covering top 5 Dot use cases + Muse/Grokbot contrast\nStatus: thread created, researching product claims…",
        },
        result: "Opened a Codex worker thread for the comparison site.",
        durationMs: 1300,
      },
      {
        title: "Verify product claims",
        kind: "research",
        detail: "Cross-checking Dots, Muse, and Grokbot positioning.",
        browse: {
          title: "research · competitive notes",
          url: "https://research.dot/assistant-landscape",
          content:
            "Dots — GPT-6 Astra, orchestration + proactive cloud computer, Pro+.\nMuse — Spark 1.3, free tier, lighter personal assistant.\nGrokbot — Grok 4.7, ~$20/mo, middle ground.\nTop use cases: workflow feedback, marketing launch, research, sales, content.",
        },
        result: "Locked competitor matrix and five use cases.",
        durationMs: 1500,
      },
      {
        title: "Build local preview site",
        kind: "code",
        detail: "Soul implementing pages; Dot watching the thread.",
        browse: {
          title: "localhost:4321 · preview",
          url: "http://127.0.0.1:4321",
          content:
            "Dots Comparison\n\nFind your use case\n• Workflow feedback loops\n• Marketing launches\n• Research analysis\n• Sales follow-through\n• Content production\n\nEach card contrasts Dots · Muse · Grokbot.",
        },
        result: "Local preview is running with the five use-case pages.",
        durationMs: 1800,
      },
      {
        title: "Pin preview for review",
        kind: "write",
        detail: "Save the handoff so you can open the preview later.",
        requiresApproval: true,
        result: "Comparison site handoff saved.",
        durationMs: 800,
      },
    ],
    artifact: `# Dots comparison site — handoff

## Preview
Local site enumerates five use cases and contrasts **Dots / Muse / Grokbot**.

## Use cases
1. Workflow feedback
2. Marketing launch
3. Research analysis
4. Sales
5. Content production

## Orchestration note
Dot ran this as a Codex worker thread (Soul 6.1) while staying available in chat — the remote-orchestration pattern from early-access demos.`,
    reply: (name) =>
      `Got it — ${name} will open a Codex worker thread, verify claims, and build a local comparison site. I'll keep orchestrating from this chat and ping you when the preview is ready.`,
  },
  {
    match: /youtube|analytics|videos|studio|channel/i,
    goalLabel: "YouTube Studio analytics review",
    threadLabel: "Cloud computer · YouTube Studio",
    workerModel: "Astra",
    memory: {
      kind: "project",
      text: "Reviewing recent long-form YouTube performance.",
    },
    steps: [
      {
        title: "Open YouTube Studio",
        kind: "browse",
        detail: "Launching Studio on the cloud computer — login may be required.",
        browse: {
          title: "YouTube Studio",
          url: "https://studio.youtube.com",
          content:
            "Sign in to continue to YouTube Studio\n\nSelect account to analyze the last 10 long-form videos.\n2-step verification may be required.",
        },
        needsAuth: {
          site: "YouTube Studio",
          message:
            "I hit Google sign-in + 2FA on my cloud computer. Take over to finish authentication, then return control.",
        },
        result: "Signed into YouTube Studio on the cloud computer.",
        durationMs: 1200,
      },
      {
        title: "Pull last 10 long-form videos",
        kind: "analyze",
        detail: "Scraping analytics pages for views, CTR, and retention.",
        browse: {
          title: "Analytics · Content",
          url: "https://studio.youtube.com/channel/analytics",
          content:
            "Last 10 long-form:\n1. Dots early access — 84k views, 7.2% CTR, 48% avg view\n2. Codex tips — 61k, 5.1% CTR, 41%\n3. Claude Code setup — 52k, 6.4% CTR, 45%\n…\nPattern: product-access + comparison thumbnails outperform pure tutorials.",
        },
        result: "Collected metrics for the last 10 long-form uploads.",
        durationMs: 1700,
      },
      {
        title: "Write performance brief",
        kind: "draft",
        detail: "Summarizing winners, middling videos, and next bets.",
        result: "Drafted a concise YouTube performance brief.",
        durationMs: 1400,
      },
      {
        title: "Save analytics brief",
        kind: "write",
        detail: "Persist the brief to the workspace.",
        requiresApproval: true,
        result: "Analytics brief saved.",
        durationMs: 700,
      },
    ],
    artifact: `# YouTube analytics — last 10 long-form

## What's working
- **Early-access / product drops** win on CTR and average view duration
- Comparison framing (Dots vs Muse vs Grokbot) keeps retention past the intro

## Middling
- Generic “tips” videos without a timely hook

## Next bets
1. Ship a 10-minute “remote orchestration with Dots” walkthrough
2. Thumbnail: avatar + competitor logos, less text
3. CTA to a standing goal: weekly Studio check-in`,
    reply: (name) =>
      `${name} will open YouTube Studio on the cloud computer. If Google asks for 2FA, take over briefly — then I'll finish the last-10 analysis.`,
  },
  {
    match: /inventory|api|deprecate|pull request|pr\b|repo|dependency|codex/i,
    goalLabel: "Retire old inventory API",
    threadLabel: "GitHub · commerce",
    workerModel: "Astra",
    memory: {
      kind: "project",
      text: "Retiring the legacy inventory API before shutdown.",
    },
    steps: [
      {
        title: "Trace inventory API dependencies",
        kind: "code",
        detail: "Mapping callers across checkout, warehouse, and admin services.",
        browse: {
          title: "repo · inventory-api",
          url: "https://github.com/acme/commerce/tree/main/services/inventory-api",
          content:
            "Legacy endpoint: GET /v1/inventory/:sku\nCallers found:\n• checkout-service (12 refs)\n• warehouse-worker (4 refs)\n• admin-dashboard (2 refs)\nReplacement: inventory-gateway /v2/stock\nShutdown window: Friday 18:00 UTC",
        },
        result: "Found 18 call sites across 3 services.",
        durationMs: 1500,
      },
      {
        title: "Update integrations to /v2",
        kind: "code",
        detail: "Rewriting clients onto inventory-gateway and removing dead feature flags.",
        browse: {
          title: "diff · checkout-service",
          url: "https://github.com/acme/commerce/compare/retire-inventory-v1",
          content:
            "checkout-service/src/inventory.ts\n- fetch('/v1/inventory/' + sku)\n+ fetch('/v2/stock?sku=' + sku)\n\nwarehouse-worker/jobs/sync.ts\n- InventoryClient.legacyGet(sku)\n+ InventoryGateway.getStock(sku)\n\n3 feature flags marked for deletion.",
        },
        result: "Updated integrations in checkout, warehouse, and admin.",
        durationMs: 1800,
      },
      {
        title: "Run test suite",
        kind: "test",
        detail: "Running unit + contract tests on the cloud computer.",
        browse: {
          title: "tests · cloud shell",
          url: "dot://computer/shell",
          content:
            "$ pnpm test --filter=inventory*\n✓ checkout-service 42 passed\n✓ warehouse-worker 18 passed\n✓ admin-dashboard 9 passed\n✓ contract: inventory-gateway 6 passed\n\nAll green in 41.2s",
        },
        result: "75 tests passed across affected packages.",
        durationMs: 1600,
      },
      {
        title: "Open three pull requests",
        kind: "pr",
        detail: "Push branches and open PRs for checkout, warehouse, and admin.",
        requiresApproval: true,
        result: "Opened 3 PRs ready for human review.",
        durationMs: 1100,
      },
    ],
    pullRequests: [
      {
        number: 841,
        title: "chore(checkout): migrate inventory client to /v2",
        repo: "acme/commerce",
        branch: "retire-inventory-v1-checkout",
        summary: "Swaps legacy /v1 inventory calls for inventory-gateway and drops unused flags.",
        filesChanged: 6,
        status: "ready",
      },
      {
        number: 842,
        title: "chore(warehouse): use InventoryGateway.getStock",
        repo: "acme/commerce",
        branch: "retire-inventory-v1-warehouse",
        summary: "Updates sync jobs and contract fixtures for the v2 stock API.",
        filesChanged: 4,
        status: "ready",
      },
      {
        number: 843,
        title: "chore(admin): remove inventory v1 debug panel",
        repo: "acme/commerce",
        branch: "retire-inventory-v1-admin",
        summary: "Deletes the deprecated SKU inspector and points UI at /v2.",
        filesChanged: 3,
        status: "draft",
      },
    ],
    artifact: `# Retire inventory API — handoff

## What changed
- Traced 18 call sites across checkout, warehouse, and admin
- Migrated clients to \`inventory-gateway /v2/stock\`
- Tests green (75 passed)

## Pull requests
1. #841 checkout migration — ready for review
2. #842 warehouse migration — ready for review
3. #843 admin cleanup — draft

## Still needs a human
- Confirm Friday shutdown window with platform
- Merge order: checkout → warehouse → admin
- Monitor error budgets for 2 hours post-merge`,
    reply: (name) =>
      `On it. I'll trace the inventory API, update the integrations, run tests, then pause before opening PRs — same shape as the DevDay Alfred demo, just with me (${name}) doing the work.`,
  },
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
Own the **weekday focus cafe**: quieter seating, reliable Wi‑Fi, simple membership, and a midday lunch set.`,
    reply: (name) =>
      `${name} on research — I'll draft a one-page brief and ask before I save anything lasting.`,
  },
  {
    match: /invoice|billing|accounts? payable|email/i,
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
            "Overdue: Acme Studio $2,400 (12d), Northline Co $880 (21d), Bright Harbor $1,150 (7d).",
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

**Acme Studio — $2,400** · Friendly nudge on invoice #1042
**Northline Co — $880** · Overdue invoice #991 — please advise
**Bright Harbor — $1,150** · Soft reminder on invoice #1108`,
    reply: () =>
      "I'll gather the overdue invoices, draft follow-ups, and pause before anything is queued to send.",
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
          content: `Working notes for: ${goal}`,
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
    artifact: `# Progress Report\n\n## Goal\n${goal}\n\nFirst deliverable ready for your review.`,
    reply: (name) =>
      `Got it. ${name} will work this on the cloud computer and check with you before saving anything lasting.`,
  };
}

function pickPlan(goal: string): PlanSeed {
  return PLANS.find((p) => p.match.test(goal)) ?? genericPlan(goal);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stepNeedsApproval(step: TaskStep, state: WorkspaceState): boolean {
  if (!step.requiresApproval) return false;
  if (step.kind === "pr") {
    const rule = state.rules.find((r) => r.id === "rule-pr");
    if (rule?.mode === "allow") return false;
    if (rule?.mode === "block") return true;
  }
  if (step.kind === "write") {
    const rule = state.rules.find((r) => r.id === "rule-send");
    if (rule?.mode === "allow" && /email|send|message/i.test(step.title)) {
      return false;
    }
  }
  return true;
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

async function createApproval(task: Task, step: TaskStep): Promise<Approval> {
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

async function finishTask(
  taskId: string,
  artifact: string,
  pullRequests?: PlanSeed["pullRequests"],
) {
  const state = await readState();
  const name = state.agentName;

  await updateState((s) => {
    const task = s.tasks.find((t) => t.id === taskId);
    if (!task) return;
    task.status = "completed";
    task.artifact = artifact;
    if (pullRequests?.length) {
      task.pullRequests = pullRequests.map((pr) => ({
        ...pr,
        id: randomUUID(),
        taskId,
        createdAt: new Date().toISOString(),
      }));
    }
    task.updatedAt = new Date().toISOString();
    s.agentStatus = s.tasks.some(
      (t) => t.status === "running" || t.status === "waiting_approval",
    )
      ? s.agentStatus
      : "idle";
    s.computer.status = "idle";
    s.computer.currentAction = "Standing by for the next goal.";
    s.computer.logs.unshift("Task completed.");

    const standing = s.standingGoals.find((g) => /deprecated|inventory/i.test(g.title));
    if (standing && pullRequests?.length) {
      standing.status = "watching";
    }
  });

  if (pullRequests?.length) {
    await addActivity(
      "pr",
      `Opened ${pullRequests.length} pull requests for review.`,
      taskId,
    );
  }
  await addActivity("work", "Finished the current goal.", taskId);
  await addMessage(
    "assistant",
    pullRequests?.length
      ? `Done — ${pullRequests.length} PRs are ready in the Tasks panel. ${name} kept the dependency map in memory so we can watch the shutdown window next.`
      : `Done — the deliverable is ready in the task panel. ${name} kept the useful bits in memory so we can continue later.`,
    taskId,
  );
  await setAgentStatus((await readState()).agentStatus);
}

async function runTaskLoop(
  taskId: string,
  artifact: string,
  pullRequests?: PlanSeed["pullRequests"],
) {
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
        await finishTask(taskId, artifact, pullRequests);
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
        const standing = s.standingGoals.find((g) =>
          /deprecated|inventory/i.test(g.title),
        );
        if (standing && /inventory|api|pr/i.test(t.goal)) {
          standing.status = "acting";
        }
      });

      await addActivity("work", step.title, taskId);
      await setComputerWorking(step.detail ?? step.title, step.browse);

      if (step.needsAuth) {
        const challengeId = randomUUID();
        await updateState((s) => {
          s.computer.authChallenge = {
            id: challengeId,
            site: step.needsAuth!.site,
            message: step.needsAuth!.message,
            status: "pending",
            createdAt: new Date().toISOString(),
          };
          s.computer.mode = "user";
          s.computer.status = "waiting";
          s.computer.currentAction = `Auth needed: ${step.needsAuth!.site}`;
          s.agentStatus = "paused";
          const t = s.tasks.find((x) => x.id === taskId);
          if (t) {
            t.status = "paused";
            t.updatedAt = new Date().toISOString();
          }
        });
        await addActivity(
          "handoff",
          `Take over for ${step.needsAuth.site} login / 2FA.`,
          taskId,
        );
        await addMessage(
          "assistant",
          `I need you on the cloud computer for **${step.needsAuth.site}**.\n\n${step.needsAuth.message}`,
          taskId,
        );

        // Wait until auth is resolved or user returns control after resolving
        while (true) {
          await sleep(700);
          const authState = await readState();
          const challenge = authState.computer.authChallenge;
          if (
            !challenge ||
            challenge.id !== challengeId ||
            challenge.status === "resolved"
          ) {
            break;
          }
          if (
            authState.computer.mode === "agent" &&
            challenge.status === "pending"
          ) {
            // User returned control without finishing — keep waiting on agent but re-pause
            await updateState((s) => {
              if (s.computer.authChallenge?.id === challengeId) {
                s.computer.mode = "user";
                s.agentStatus = "paused";
                s.computer.status = "waiting";
              }
            });
          }
        }

        await updateState((s) => {
          const t = s.tasks.find((x) => x.id === taskId);
          if (t && t.status === "paused") {
            t.status = "running";
            t.updatedAt = new Date().toISOString();
          }
          s.agentStatus = "working";
          s.computer.mode = "agent";
          s.computer.status = "working";
          s.computer.currentAction = step.detail ?? step.title;
        });
      }

      await sleep(Math.max(600, step.durationMs ?? 1200));

      const mid = await readState();
      if (mid.computer.mode === "user" && !mid.computer.authChallenge) {
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

      if (stepNeedsApproval(step, mid)) {
        const liveTask = mid.tasks.find((t) => t.id === taskId);
        const liveStep = liveTask?.steps[liveTask.currentStepIndex];
        if (liveTask && liveStep) {
          const rule = mid.rules.find((r) => r.id === "rule-pr");
          if (liveStep.kind === "pr" && rule?.mode === "block") {
            await updateState((s) => {
              const t = s.tasks.find((x) => x.id === taskId);
              if (!t) return;
              const st = t.steps[t.currentStepIndex];
              if (st) st.status = "skipped";
              t.status = "cancelled";
              t.error = "Blocked by custom rule: Open pull requests";
              s.agentStatus = "idle";
              s.computer.status = "idle";
            });
            await addMessage(
              "assistant",
              "Stopped — your custom rules block opening pull requests. Flip that rule to Ask or Allow if you want me to continue.",
              taskId,
            );
            break;
          }
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
  if (/be quieter|less proactive|too many (pings|messages)|quiet mode/i.test(goal)) {
    await setProactivity("quiet");
    await addMessage("user", goal);
    await addMessage(
      "assistant",
      "Got it — dialing proactivity down to **quiet**. I won't ping about inbox noise unless you ask. You can raise it anytime in Profile.",
    );
    return readState();
  }
  if (/be more proactive|ping me more|high proactivity/i.test(goal)) {
    await setProactivity("high");
    await addMessage("user", goal);
    await addMessage(
      "assistant",
      "On it — proactivity is now **high**. I'll surface important mail and thread updates more often.",
    );
    return readState();
  }

  const state = await readState();
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
    needsAuth: s.needsAuth,
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
    threadLabel: plan.threadLabel ?? "Cloud thread",
    workerModel: plan.workerModel ?? "Astra",
  };

  await updateState((s) => {
    s.tasks.unshift(task);
    s.selectedTaskId = task.id;
    s.agentStatus = "thinking";
  });

  await addMessage("user", goal, task.id);
  await addMessage("assistant", plan.reply(state.agentName), task.id);
  await addActivity(
    plan.workerModel ? "orchestrate" : "work",
    plan.workerModel
      ? `Orchestrating ${plan.workerModel}: ${plan.goalLabel}`
      : `Started: ${plan.goalLabel}`,
    task.id,
  );

  if (plan.memory) {
    await upsertMemory(plan.memory.kind, plan.memory.text);
    await addActivity("memory", `Remembered: ${plan.memory.text}`, task.id);
  }

  void runTaskLoop(task.id, plan.artifact, plan.pullRequests);
  return readState();
}

export async function resumeTask(taskId: string) {
  const state = await readState();
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task || task.status === "completed") return;
  const plan = pickPlan(task.goal);
  const artifact =
    task.plannedArtifact ??
    task.artifact ??
    `# Progress\n\nGoal: ${task.goal}`;
  void runTaskLoop(taskId, artifact, plan.pullRequests);
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
  const name = (await readState()).agentName;
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
      state.computer.logs.unshift(`Control returned to ${name}.`);
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
    mode === "user"
      ? "You took over the computer."
      : `Returned control to ${name}.`,
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

export async function updateRule(
  ruleId: string,
  mode: "allow" | "ask" | "block",
) {
  await updateState((state) => {
    const rule = state.rules.find((r) => r.id === ruleId);
    if (rule) rule.mode = mode;
  });
  await addActivity("info", `Updated rule: ${ruleId} → ${mode}`);
  return readState();
}

export async function toggleApp(appId: string) {
  await updateState((state) => {
    const app = state.apps.find((a) => a.id === appId);
    if (app) app.connected = !app.connected;
    if (appId === "gmail") {
      const standing = state.standingGoals.find((g) => g.id === "sg-inbox");
      if (standing) {
        standing.status = app?.connected ? "watching" : "paused";
      }
    }
  });
  return readState();
}

export async function setProactivity(
  level: WorkspaceState["proactivity"],
): Promise<WorkspaceState> {
  await updateState((state) => {
    state.proactivity = level;
  });
  await addActivity("info", `Proactivity set to ${level}.`);
  return readState();
}

export async function selectTask(taskId: string | null): Promise<WorkspaceState> {
  await updateState((state) => {
    state.selectedTaskId = taskId;
  });
  return readState();
}

export async function resolveAuthChallenge(): Promise<WorkspaceState> {
  await updateState((state) => {
    if (state.computer.authChallenge) {
      state.computer.authChallenge.status = "resolved";
    }
    state.computer.mode = "agent";
    state.computer.status = "working";
    state.computer.currentAction = "Auth complete — resuming.";
    state.computer.logs.unshift("User finished login / 2FA. Control returned.");
    state.agentStatus = "working";
    for (const task of state.tasks) {
      if (task.status === "paused") {
        task.status = "running";
        task.updatedAt = new Date().toISOString();
      }
    }
  });
  await addActivity("handoff", "Auth finished — returned control to Dot.");
  await addMessage(
    "assistant",
    "Thanks — I'm signed in and picking the work back up.",
  );
  const state = await readState();
  for (const task of state.tasks) {
    if (task.status === "running") {
      await resumeTask(task.id);
    }
  }
  return readState();
}

const PROACTIVE_SNIPPETS = [
  {
    subject: "Acme Studio — contract revision",
    body: "Just got an email from **Jordan at Acme Studio** asking if we can move the inventory cutover to Thursday. Want me to draft a reply or update the standing goal?",
  },
  {
    subject: "Bright Harbor — invoice question",
    body: "Heads up — **Bright Harbor** replied on invoice #1108 saying payment lands Friday. I logged it against the receivables thread.",
  },
  {
    subject: "Hiring loop — design trial",
    body: "New mail: a design trial candidate accepted the take-home. Should I schedule a review block or leave it for you?",
  },
];

let proactiveTimer: ReturnType<typeof setInterval> | null = null;
let proactiveIndex = 0;

export function ensureProactiveLoop() {
  if (proactiveTimer) return;
  proactiveTimer = setInterval(() => {
    void maybeSendProactive();
  }, 14000);
}

async function maybeSendProactive() {
  try {
    const state = await readState();
    if (!state.onboarded) return;
    if (state.proactivity === "quiet") return;
    const gmail = state.apps.find((a) => a.id === "gmail");
    if (!gmail?.connected) return;

    const minGapMs = state.proactivity === "high" ? 12000 : 28000;
    if (
      state.lastProactiveAt &&
      Date.now() - new Date(state.lastProactiveAt).getTime() < minGapMs
    ) {
      return;
    }
    // Don't stack on top of an auth or approval wait too aggressively
    if (state.agentStatus === "waiting" && state.proactivity !== "high") return;

    const snippet = PROACTIVE_SNIPPETS[proactiveIndex % PROACTIVE_SNIPPETS.length];
    proactiveIndex += 1;

    await updateState((s) => {
      s.lastProactiveAt = new Date().toISOString();
      const standing = s.standingGoals.find((g) => g.id === "sg-inbox");
      if (standing) standing.status = "acting";
    });
    await addActivity("proactive", `Inbox ping: ${snippet.subject}`);
    await addMessage(
      "assistant",
      `Proactive ping — ${snippet.subject}\n\n${snippet.body}\n\n_(Say “be quieter” or flip proactivity in Profile if this is too chatty.)_`,
    );
    await updateState((s) => {
      const standing = s.standingGoals.find((g) => g.id === "sg-inbox");
      if (standing && s.agentStatus === "idle") standing.status = "watching";
    });
  } catch {
    // ignore timer errors
  }
}

// Kick the loop when the module loads in the server runtime
ensureProactiveLoop();
