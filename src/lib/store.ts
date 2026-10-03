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
import {
  defaultComputerFiles,
  defaultDots,
  defaultPages,
  DEFAULT_SPACES,
  defaultTerminal,
} from "./opendots/defaults";
import {
  defaultPluginConnections,
  defaultPluginStandingGoals,
  mergePluginConnections,
} from "./plugins/state";
import { getPluginDef } from "./plugins/registry";

const DATA_DIR = path.join(process.cwd(), ".data");
const STATE_FILE = path.join(DATA_DIR, "workspace.json");

function defaultComputer(name: string): ComputerState {
  return {
    mode: "agent",
    status: "idle",
    currentAction: undefined,
    authChallenge: null,
    activeView: "browser",
    files: defaultComputerFiles(),
    terminal: defaultTerminal(),
    tabs: [
      {
        id: "home",
        title: `${name}'s Computer`,
        url: "about:blank",
        content: `${name}'s computer is ready — browser, files, and shell persist across stop and start.`,
        active: true,
      },
    ],
    logs: ["Computer booted.", "Browser ready.", "Waiting for a goal."],
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
      description: "Execute test suites on the computer.",
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

export function defaultState(): WorkspaceState {
  const now = new Date().toISOString();
  const plugins = defaultPluginConnections();
  const dots = defaultDots();
  return {
    onboarded: false,
    agentName: "Scout",
    avatarTone: "coral",
    proactivity: "balanced",
    localComputerConnected: true,
    selectedTaskId: null,
    selectedDotId: dots[0]?.id ?? null,
    selectedSpaceId: null,
    selectedPageId: null,
    view: "chat",
    ownerName: "Miles Seade",
    lastProactiveAt: null,
    agentStatus: "idle",
    messages: [],
    tasks: [],
    approvals: [],
    reviews: [],
    dots,
    spaces: DEFAULT_SPACES,
    pages: defaultPages(),
    memory: [
      {
        id: randomUUID(),
        kind: "fact",
        text: "Owner: Miles Seade · CS Eng @ University of Michigan · mseade@umich.edu · GitHub mseade3.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        kind: "project",
        text: "Summer 2027 internship prep — deepen AADE (Ann Arbor Digital Growth Engine) as the lead portfolio project; also heads-notes, summer-automation, practicum ML rebuild.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        kind: "preference",
        text: "Prefer review-before-save for anything lasting in Spaces. Resume format: Wharton-style one-pager.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        kind: "preference",
        text: "Scout researches roles & AADE evidence; Quill writes bullets/narratives; Relay tracks applications.",
        createdAt: now,
        updatedAt: now,
      },
    ],
    rules: defaultRules(),
    plugins,
    standingGoals: defaultPluginStandingGoals(plugins),
    computer: defaultComputer("Scout"),
    activity: [
      {
        id: randomUUID(),
        type: "info",
        text: "Miles’s 2027 internship workspace ready — create your Dot profile to begin.",
        createdAt: now,
      },
    ],
  };
}

function migrate(raw: Partial<WorkspaceState> & { agentName?: string }): WorkspaceState {
  const base = defaultState();
  const name = raw.agentName || base.agentName;
  const plugins = mergePluginConnections(raw.plugins, raw.apps);
  const standingGoals = raw.standingGoals?.length
    ? mergeStandingGoals(raw.standingGoals, plugins)
    : defaultPluginStandingGoals(plugins);
  const dots = raw.dots?.length ? raw.dots : base.dots;
  const spaces = raw.spaces?.length ? raw.spaces : base.spaces;
  const pages = raw.pages?.length ? raw.pages : base.pages;
  return {
    ...base,
    ...raw,
    onboarded: raw.onboarded ?? Boolean(raw.messages && raw.messages.length > 0),
    agentName: name,
    avatarTone: (raw.avatarTone as AvatarTone) || base.avatarTone,
    proactivity: raw.proactivity ?? base.proactivity,
    localComputerConnected: raw.localComputerConnected ?? true,
    selectedTaskId: raw.selectedTaskId ?? null,
    selectedDotId: raw.selectedDotId ?? dots[0]?.id ?? null,
    selectedSpaceId: raw.selectedSpaceId ?? null,
    selectedPageId: raw.selectedPageId ?? null,
    view: raw.view ?? "chat",
    ownerName: raw.ownerName ?? base.ownerName,
    lastProactiveAt: raw.lastProactiveAt ?? null,
    rules: raw.rules?.length ? raw.rules : base.rules,
    plugins,
    standingGoals,
    dots,
    spaces,
    pages,
    reviews: raw.reviews ?? [],
    computer: {
      ...defaultComputer(name),
      ...(raw.computer ?? {}),
      authChallenge: raw.computer?.authChallenge ?? null,
      files: raw.computer?.files?.length
        ? raw.computer.files
        : defaultComputerFiles(),
      terminal: raw.computer?.terminal?.length
        ? raw.computer.terminal
        : defaultTerminal(),
      activeView: raw.computer?.activeView ?? "browser",
    },
    messages: raw.messages ?? [],
    tasks: raw.tasks ?? [],
    approvals: raw.approvals ?? [],
    memory: raw.memory?.length ? raw.memory : base.memory,
    activity: raw.activity?.length ? raw.activity : base.activity,
    agentStatus: raw.agentStatus ?? "idle",
  };
}

function mergeStandingGoals(
  existing: WorkspaceState["standingGoals"],
  plugins: WorkspaceState["plugins"],
): WorkspaceState["standingGoals"] {
  const catalog = defaultPluginStandingGoals(plugins);
  const byId = new Map(existing.map((g) => [g.id, g]));
  return catalog.map((g) => {
    const prev = byId.get(g.id);
    if (!prev) return g;
    return {
      ...g,
      ...prev,
      pluginId: g.pluginId,
      enabled: prev.enabled ?? g.enabled,
    };
  });
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
  taskIdOrExtras?:
    | string
    | {
        taskId?: string;
        dotId?: string;
        actions?: Message["actions"];
        reviewId?: string;
      },
): Promise<Message> {
  const extras =
    typeof taskIdOrExtras === "string"
      ? { taskId: taskIdOrExtras }
      : taskIdOrExtras;
  const message: Message = {
    id: randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
    taskId: extras?.taskId,
    dotId: extras?.dotId,
    actions: extras?.actions,
    reviewId: extras?.reviewId,
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
  options?: {
    connectGmail?: boolean;
    connectYoutube?: boolean;
    connectCanvas?: boolean;
    connectGithub?: boolean;
    ownerName?: string;
  },
): Promise<WorkspaceState> {
  const trimmed = name.trim().slice(0, 24) || "Scout";
  const now = new Date().toISOString();
  const state = defaultState();
  state.onboarded = true;
  state.agentName = trimmed;
  state.avatarTone = avatarTone;
  state.ownerName = options?.ownerName?.trim() || "Miles Seade";
  state.computer = defaultComputer(trimmed);

  // Rename primary researcher to the chosen name while keeping Quill/Relay
  const scout = state.dots.find((d) => d.id === "dot-scout");
  if (scout) {
    scout.name = trimmed;
    scout.tone =
      avatarTone === "indigo"
        ? "violet"
        : avatarTone === "sky"
          ? "sky"
          : avatarTone === "amber"
            ? "amber"
            : avatarTone === "teal"
              ? "teal"
              : "coral";
    scout.lastActivity = "Online";
    scout.lastActivityAt = now;
  }
  state.selectedDotId = "dot-scout";
  state.view = "chat";

  const wanted: Record<string, boolean> = {
    gmail: options?.connectGmail ?? true,
    youtube: options?.connectYoutube ?? false,
    canvas: options?.connectCanvas ?? true,
    github: options?.connectGithub ?? true,
  };

  state.plugins = state.plugins.map((plugin) => {
    if (!(plugin.id in wanted)) return plugin;
    const connected = wanted[plugin.id]!;
    const def = getPluginDef(plugin.id);
    return {
      ...plugin,
      connected: connected && Boolean(def?.implemented),
      connectedAt: connected ? now : null,
    };
  });
  state.standingGoals = defaultPluginStandingGoals(state.plugins);

  state.messages = [
    {
      id: randomUUID(),
      role: "assistant",
      content: `I'm ${trimmed} — research Dot for Miles’s **Summer 2027 internship** workspace. We deepen **AADE** (Ann Arbor Digital Growth Engine) as the lead portfolio project, then turn evidence into applications.\n\nTry: *Review the AADE README metrics, draft portfolio talking points for Summer 2027 SWE internships, and save notes to Applications.*`,
      createdAt: now,
      dotId: "dot-scout",
    },
  ];
  state.activity = [
    {
      id: randomUUID(),
      type: "info",
      text: `${trimmed}, Quill, and Relay are online — Portfolio · Research · Applications ready.`,
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
