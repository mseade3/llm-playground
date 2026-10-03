import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type {
  ActivityEvent,
  Approval,
  AvatarTone,
  ComputerState,
  MemoryNote,
  Message,
  Task,
  WorkspaceState,
} from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STATE_FILE = path.join(DATA_DIR, "workspace.json");

function defaultComputer(name: string): ComputerState {
  return {
    mode: "agent",
    status: "idle",
    currentAction: undefined,
    authChallenge: null,
    tabs: [
      {
        id: "home",
        title: `${name}'s Computer`,
        url: "about:blank",
        content: `${name}'s cloud computer is ready — browser, shell, and repo access. Hand over a goal and watch the work land here.`,
        active: true,
      },
    ],
    logs: ["Cloud computer booted.", "Browser ready.", "Waiting for a goal."],
  };
}

function defaultRules() {
  return [
    {
      id: "rule-read",
      label: "Read repos & docs",
      description: "Browse code, issues, and research without asking.",
      mode: "allow" as const,
    },
    {
      id: "rule-tests",
      label: "Run tests",
      description: "Execute test suites on the cloud computer.",
      mode: "allow" as const,
    },
    {
      id: "rule-pr",
      label: "Open pull requests",
      description: "Push branches and open PRs on connected GitHub.",
      mode: "ask" as const,
    },
    {
      id: "rule-send",
      label: "Send messages externally",
      description: "Email, Slack, or Teams outbound messages.",
      mode: "ask" as const,
    },
    {
      id: "rule-delete",
      label: "Delete production data",
      description: "Destructive writes against live systems.",
      mode: "block" as const,
    },
  ];
}

function defaultApps() {
  return [
    {
      id: "github",
      name: "GitHub",
      connected: true,
      detail: "Repos + PRs",
    },
    {
      id: "slack",
      name: "Slack",
      connected: true,
      detail: "Notify on decisions",
    },
    {
      id: "gmail",
      name: "Gmail",
      connected: true,
      detail: "Proactive inbox watch",
    },
    {
      id: "youtube",
      name: "YouTube",
      connected: false,
      detail: "Studio analytics (needs login)",
    },
    {
      id: "notion",
      name: "Notion",
      connected: false,
      detail: "Docs & briefs",
    },
  ];
}

function defaultStandingGoals() {
  return [
    {
      id: "sg-deps",
      title: "Watch for deprecated APIs in inventory services",
      cadence: "Continuous",
      status: "watching" as const,
    },
    {
      id: "sg-inbox",
      title: "Surface urgent customer emails before standup",
      cadence: "Weekdays 8:30am",
      status: "paused" as const,
    },
  ];
}

export function defaultState(): WorkspaceState {
  const now = new Date().toISOString();
  return {
    onboarded: false,
    agentName: "Winston",
    avatarTone: "teal",
    proactivity: "balanced",
    localComputerConnected: true,
    selectedTaskId: null,
    lastProactiveAt: null,
    agentStatus: "idle",
    messages: [],
    tasks: [],
    approvals: [],
    memory: [
      {
        id: randomUUID(),
        kind: "preference",
        text: "Prefer small PRs with clear summaries over giant diffs.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        kind: "preference",
        text: "Ask before opening pull requests or sending external messages.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        kind: "preference",
        text: "When remote, orchestrate Codex-style threads instead of making me hop between projects.",
        createdAt: now,
        updatedAt: now,
      },
    ],
    rules: defaultRules(),
    apps: defaultApps(),
    standingGoals: defaultStandingGoals(),
    computer: defaultComputer("Winston"),
    activity: [
      {
        id: randomUUID(),
        type: "info",
        text: "Create your Dot to get started.",
        createdAt: now,
      },
    ],
  };
}

function migrate(raw: Partial<WorkspaceState> & { agentName?: string }): WorkspaceState {
  const base = defaultState();
  const name = raw.agentName || base.agentName;
  const apps =
    raw.apps?.some((a) => a.id === "youtube") ? raw.apps : base.apps;
  return {
    ...base,
    ...raw,
    onboarded: raw.onboarded ?? Boolean(raw.messages && raw.messages.length > 0),
    agentName: name,
    avatarTone: (raw.avatarTone as AvatarTone) || base.avatarTone,
    proactivity: raw.proactivity ?? base.proactivity,
    localComputerConnected: raw.localComputerConnected ?? true,
    selectedTaskId: raw.selectedTaskId ?? null,
    lastProactiveAt: raw.lastProactiveAt ?? null,
    rules: raw.rules?.length ? raw.rules : base.rules,
    apps,
    standingGoals: raw.standingGoals?.length
      ? raw.standingGoals
      : base.standingGoals,
    computer: {
      ...defaultComputer(name),
      ...(raw.computer ?? {}),
      authChallenge: raw.computer?.authChallenge ?? null,
    },
    messages: raw.messages ?? [],
    tasks: raw.tasks ?? [],
    approvals: raw.approvals ?? [],
    memory: raw.memory?.length ? raw.memory : base.memory,
    activity: raw.activity?.length ? raw.activity : base.activity,
    agentStatus: raw.agentStatus ?? "idle",
  };
}

let cache: WorkspaceState | null = null;
let writeQueue: Promise<void> = Promise.resolve();

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readState(): Promise<WorkspaceState> {
  if (cache) return cache;
  await ensureDataDir();
  try {
    const raw = await fs.readFile(STATE_FILE, "utf8");
    cache = migrate(JSON.parse(raw) as Partial<WorkspaceState>);
    return cache;
  } catch {
    cache = defaultState();
    await persist(cache);
    return cache;
  }
}

async function persist(state: WorkspaceState) {
  await ensureDataDir();
  const payload = JSON.stringify(state, null, 2);
  writeQueue = writeQueue.then(() => fs.writeFile(STATE_FILE, payload, "utf8"));
  await writeQueue;
}

export async function updateState(
  mutator: (state: WorkspaceState) => void | Promise<void>,
): Promise<WorkspaceState> {
  const state = await readState();
  await mutator(state);
  cache = state;
  await persist(state);
  return state;
}

export async function addMessage(
  role: Message["role"],
  content: string,
  taskId?: string,
): Promise<Message> {
  const message: Message = {
    id: randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
    taskId,
  };
  await updateState((state) => {
    state.messages.push(message);
  });
  return message;
}

export async function addActivity(
  type: ActivityEvent["type"],
  text: string,
  taskId?: string,
): Promise<ActivityEvent> {
  const event: ActivityEvent = {
    id: randomUUID(),
    type,
    text,
    createdAt: new Date().toISOString(),
    taskId,
  };
  await updateState((state) => {
    state.activity.unshift(event);
    state.activity = state.activity.slice(0, 80);
  });
  return event;
}

export async function upsertMemory(
  kind: MemoryNote["kind"],
  text: string,
): Promise<MemoryNote> {
  const now = new Date().toISOString();
  let note: MemoryNote | null = null;
  await updateState((state) => {
    const existing = state.memory.find(
      (m) => m.kind === kind && m.text.toLowerCase() === text.toLowerCase(),
    );
    if (existing) {
      existing.updatedAt = now;
      note = existing;
      return;
    }
    note = {
      id: randomUUID(),
      kind,
      text,
      createdAt: now,
      updatedAt: now,
    };
    state.memory.unshift(note);
  });
  return note!;
}

export async function setAgentStatus(
  status: WorkspaceState["agentStatus"],
): Promise<void> {
  await updateState((state) => {
    state.agentStatus = status;
  });
}

export async function getTask(taskId: string): Promise<Task | undefined> {
  const state = await readState();
  return state.tasks.find((t) => t.id === taskId);
}

export async function getApproval(
  approvalId: string,
): Promise<Approval | undefined> {
  const state = await readState();
  return state.approvals.find((a) => a.id === approvalId);
}

export async function createDot(
  name: string,
  avatarTone: AvatarTone,
  options?: { connectGmail?: boolean; connectYoutube?: boolean },
): Promise<WorkspaceState> {
  const trimmed = name.trim().slice(0, 24) || "Winston";
  const now = new Date().toISOString();
  const state = defaultState();
  state.onboarded = true;
  state.agentName = trimmed;
  state.avatarTone = avatarTone;
  state.computer = defaultComputer(trimmed);
  state.apps = state.apps.map((app) => {
    if (app.id === "gmail") {
      return { ...app, connected: options?.connectGmail ?? true };
    }
    if (app.id === "youtube") {
      return { ...app, connected: options?.connectYoutube ?? false };
    }
    return app;
  });
  state.standingGoals = state.standingGoals.map((g) =>
    g.id === "sg-inbox" && (options?.connectGmail ?? true)
      ? { ...g, status: "watching" }
      : g,
  );
  state.messages = [
    {
      id: randomUUID(),
      role: "assistant",
      content: `I'm ${trimmed} — your always-on Dot. I orchestrate work across threads on my cloud computer, ping you when something important lands, and pause for logins or PRs that need your hands.\n\nTry: “Build a Dots vs Muse vs Grokbot comparison site” or “Analyze my last 10 YouTube videos.”`,
      createdAt: now,
    },
  ];
  state.activity = [
    {
      id: randomUUID(),
      type: "info",
      text: `${trimmed} is online — cloud computer + local access ready.`,
      createdAt: now,
    },
  ];
  cache = state;
  await persist(cache);
  return cache;
}

export async function resetWorkspace(): Promise<WorkspaceState> {
  cache = defaultState();
  await persist(cache);
  return cache;
}
