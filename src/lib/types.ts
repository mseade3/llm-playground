import type { PluginConnection as PluginConnectionModel } from "./plugins/types";

export type PluginConnection = PluginConnectionModel;
export type { PluginMode } from "./plugins/types";

export type MessageRole = "user" | "assistant" | "system";

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  taskId?: string;
};

export type TaskStatus =
  | "queued"
  | "running"
  | "waiting_approval"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export type StepKind =
  | "research"
  | "analyze"
  | "draft"
  | "write"
  | "browse"
  | "memory"
  | "code"
  | "test"
  | "pr";

export type TaskStep = {
  id: string;
  title: string;
  kind: StepKind;
  status: "pending" | "running" | "done" | "failed" | "skipped";
  detail?: string;
  requiresApproval?: boolean;
  result?: string;
  durationMs?: number;
  browse?: { title: string; url: string; content: string };
  /** Pause for login / 2FA takeover on the cloud computer */
  needsAuth?: { site: string; message: string };
};

export type PullRequest = {
  id: string;
  number: number;
  title: string;
  repo: string;
  branch: string;
  summary: string;
  filesChanged: number;
  status: "draft" | "ready" | "merged";
  taskId: string;
  createdAt: string;
};

export type Task = {
  id: string;
  goal: string;
  status: TaskStatus;
  steps: TaskStep[];
  currentStepIndex: number;
  createdAt: string;
  updatedAt: string;
  plannedArtifact?: string;
  artifact?: string;
  pullRequests?: PullRequest[];
  error?: string;
  /** Orchestration thread label shown in the activity rail */
  threadLabel?: string;
  /** Simulated sub-agent / worker model (e.g. Soul 6.1) */
  workerModel?: string;
};

export type Approval = {
  id: string;
  taskId: string;
  stepId: string;
  title: string;
  summary: string;
  action: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
};

export type MemoryNote = {
  id: string;
  kind: "preference" | "decision" | "project" | "fact";
  text: string;
  createdAt: string;
  updatedAt: string;
};

export type RuleMode = "allow" | "ask" | "block";

export type CustomRule = {
  id: string;
  label: string;
  description: string;
  mode: RuleMode;
};

/** @deprecated Use PluginConnection — kept for migrate compatibility */
export type ConnectedApp = {
  id: string;
  name: string;
  connected: boolean;
  detail: string;
};

export type StandingGoal = {
  id: string;
  title: string;
  cadence: string;
  status: "watching" | "acting" | "paused";
  pluginId?: string;
  enabled?: boolean;
};

export type ComputerMode = "agent" | "user";

export type BrowserTab = {
  id: string;
  title: string;
  url: string;
  content: string;
  active: boolean;
};

export type AuthChallenge = {
  id: string;
  site: string;
  message: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
};

export type ComputerState = {
  mode: ComputerMode;
  status: "idle" | "working" | "waiting" | "offline";
  currentAction?: string;
  tabs: BrowserTab[];
  logs: string[];
  authChallenge?: AuthChallenge | null;
};

export type ActivityEvent = {
  id: string;
  type:
    | "info"
    | "work"
    | "approval"
    | "memory"
    | "handoff"
    | "error"
    | "pr"
    | "proactive"
    | "orchestrate";
  text: string;
  createdAt: string;
  taskId?: string;
};

export type AvatarTone = "teal" | "coral" | "indigo" | "amber";

export type Proactivity = "quiet" | "balanced" | "high";

export type WorkspaceState = {
  onboarded: boolean;
  agentName: string;
  avatarTone: AvatarTone;
  proactivity: Proactivity;
  localComputerConnected: boolean;
  selectedTaskId?: string | null;
  messages: Message[];
  tasks: Task[];
  approvals: Approval[];
  memory: MemoryNote[];
  rules: CustomRule[];
  plugins: PluginConnection[];
  /** @deprecated migrated into plugins */
  apps?: ConnectedApp[];
  standingGoals: StandingGoal[];
  computer: ComputerState;
  activity: ActivityEvent[];
  agentStatus: "idle" | "thinking" | "working" | "waiting" | "paused";
  lastProactiveAt?: string | null;
};
