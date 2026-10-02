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

export type StepKind = "research" | "analyze" | "draft" | "write" | "browse" | "memory";

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
  error?: string;
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

export type ComputerMode = "agent" | "user";

export type BrowserTab = {
  id: string;
  title: string;
  url: string;
  content: string;
  active: boolean;
};

export type ComputerState = {
  mode: ComputerMode;
  status: "idle" | "working" | "waiting" | "offline";
  currentAction?: string;
  tabs: BrowserTab[];
  logs: string[];
};

export type ActivityEvent = {
  id: string;
  type: "info" | "work" | "approval" | "memory" | "handoff" | "error";
  text: string;
  createdAt: string;
  taskId?: string;
};

export type WorkspaceState = {
  messages: Message[];
  tasks: Task[];
  approvals: Approval[];
  memory: MemoryNote[];
  computer: ComputerState;
  activity: ActivityEvent[];
  agentName: string;
  agentStatus: "idle" | "thinking" | "working" | "waiting" | "paused";
};
