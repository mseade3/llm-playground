import type { PluginConnection as PluginConnectionModel } from "./plugins/types";
import type {
  ComputerFile,
  InlineAction,
  ReviewCard,
  Space,
  SpacePage,
  SpecialistDot,
  TerminalLine,
  WorkspaceView,
} from "./opendots/types";

export type PluginConnection = PluginConnectionModel;
export type { PluginMode } from "./plugins/types";
export type {
  ComputerFile,
  DotPermission,
  InlineAction,
  ReviewCard,
  Space,
  SpacePage,
  SpecialistDot,
  TerminalLine,
  WorkspaceView,
} from "./opendots/types";

export type MessageRole = "user" | "assistant" | "system";

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  taskId?: string;
  dotId?: string;
  actions?: InlineAction[];
  reviewId?: string;
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
  | "pr"
  | "shell"
  | "file";

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
  needsAuth?: { site: string; message: string };
  /** Inline chat action emitted when the step completes */
  inlineAction?: InlineAction;
  /** Review-before-save payload for write steps */
  review?: {
    title: string;
    summary: string;
    body: string;
    targetSpaceId: string;
  };
  fileWrite?: { path: string; content: string; sizeLabel: string };
  terminal?: { command: string; output: string };
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
  threadLabel?: string;
  workerModel?: string;
  dotId?: string;
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
  reviewId?: string;
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
  status: "idle" | "working" | "waiting" | "offline" | "running";
  currentAction?: string;
  tabs: BrowserTab[];
  logs: string[];
  authChallenge?: AuthChallenge | null;
  files: ComputerFile[];
  terminal: TerminalLine[];
  activeView: "browser" | "files" | "terminal";
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

export type AvatarTone = "teal" | "coral" | "indigo" | "amber" | "violet" | "sky";

export type Proactivity = "quiet" | "balanced" | "high";

export type WorkspaceState = {
  onboarded: boolean;
  agentName: string;
  avatarTone: AvatarTone;
  proactivity: Proactivity;
  localComputerConnected: boolean;
  selectedTaskId?: string | null;
  selectedDotId: string | null;
  selectedSpaceId: string | null;
  selectedPageId: string | null;
  view: WorkspaceView;
  ownerName: string;
  messages: Message[];
  tasks: Task[];
  approvals: Approval[];
  reviews: ReviewCard[];
  dots: SpecialistDot[];
  spaces: Space[];
  pages: SpacePage[];
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
