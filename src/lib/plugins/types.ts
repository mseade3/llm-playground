export type PluginCategory =
  | "school"
  | "code"
  | "money"
  | "comms"
  | "content"
  | "ops";

export type PluginCapability = "read" | "write" | "watch";

export type PluginMode = "mock" | "live";

export type PluginConnection = {
  id: string;
  connected: boolean;
  mode: PluginMode;
  connectedAt?: string | null;
  lastSyncAt?: string | null;
  lastSyncSummary?: string | null;
  /** Optional user-facing config (course filter, default repo, etc.) */
  config?: Record<string, string>;
};

export type PluginStandingGoalTemplate = {
  id: string;
  title: string;
  cadence: string;
};

export type PluginDefinition = {
  id: string;
  name: string;
  category: PluginCategory;
  detail: string;
  description: string;
  capabilities: PluginCapability[];
  /** Env vars that unlock live mode */
  envKeys?: string[];
  defaultStandingGoals: PluginStandingGoalTemplate[];
  actions: string[];
  /** If false, shown in catalog but connect is mock-only stub */
  implemented: boolean;
};

export type PluginActionResult = {
  ok: boolean;
  mode: PluginMode;
  summary: string;
  items?: Array<{
    id: string;
    title: string;
    subtitle?: string;
    due?: string;
    url?: string;
    meta?: Record<string, string>;
  }>;
  artifact?: string;
  error?: string;
};
