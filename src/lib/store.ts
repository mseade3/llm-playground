import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type {
  ActivityEvent,
  Approval,
  ComputerState,
  MemoryNote,
  Message,
  Task,
  WorkspaceState,
} from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STATE_FILE = path.join(DATA_DIR, "workspace.json");

function defaultComputer(): ComputerState {
  return {
    mode: "agent",
    status: "idle",
    currentAction: undefined,
    tabs: [
      {
        id: "home",
        title: "Dot Computer",
        url: "about:blank",
        content:
          "Your Dot's cloud computer is ready. Give it a goal and it will open tabs, research, and draft work here.",
        active: true,
      },
    ],
    logs: ["Cloud computer booted.", "Browser ready.", "Waiting for a goal."],
  };
}

function defaultState(): WorkspaceState {
  const now = new Date().toISOString();
  return {
    agentName: "Dot",
    agentStatus: "idle",
    messages: [
      {
        id: randomUUID(),
        role: "assistant",
        content:
          "I'm Dot — your always-on agent. Hand me a project and I'll keep working between messages, pause when I need your judgment, and remember how you like things done.\n\nTry: “Research three competitors for a neighborhood coffee shop and draft a one-page brief.”",
        createdAt: now,
      },
    ],
    tasks: [],
    approvals: [],
    memory: [
      {
        id: randomUUID(),
        kind: "preference",
        text: "Prefer concise briefs with clear next steps.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        kind: "preference",
        text: "Ask before sending messages or publishing anything external.",
        createdAt: now,
        updatedAt: now,
      },
    ],
    computer: defaultComputer(),
    activity: [
      {
        id: randomUUID(),
        type: "info",
        text: "Dot is online and listening.",
        createdAt: now,
      },
    ],
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
    cache = JSON.parse(raw) as WorkspaceState;
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

export async function resetWorkspace(): Promise<WorkspaceState> {
  cache = defaultState();
  await persist(cache);
  return cache;
}
