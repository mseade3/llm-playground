import type { PluginDefinition } from "./types";

/**
 * Catalog of life surfaces Dot can plug into.
 * Add a row here + a handler in ./handlers to ship a new surface.
 */
export const PLUGIN_CATALOG: PluginDefinition[] = [
  {
    id: "github",
    name: "GitHub",
    category: "code",
    detail: "Repos, issues, PRs",
    description:
      "Watch repos, triage issues, and open draft PRs behind the scenes. Set GITHUB_TOKEN for live mode.",
    capabilities: ["read", "write", "watch"],
    envKeys: ["GITHUB_TOKEN"],
    implemented: true,
    actions: ["sync", "list_issues", "list_prs"],
    defaultStandingGoals: [
      {
        id: "sg-github-issues",
        title: "Triage open issues on my default repo each morning",
        cadence: "Weekdays 9:00am",
      },
      {
        id: "sg-github-prs",
        title: "Watch draft PRs and nudge when CI is green",
        cadence: "Continuous",
      },
    ],
  },
  {
    id: "canvas",
    name: "Canvas",
    category: "school",
    detail: "Courses, assignments, grades",
    description:
      "Scan upcoming assignments and draft study plans. Set CANVAS_BASE_URL + CANVAS_API_TOKEN for live mode.",
    capabilities: ["read", "watch"],
    envKeys: ["CANVAS_BASE_URL", "CANVAS_API_TOKEN"],
    implemented: true,
    actions: ["sync", "list_assignments", "list_courses"],
    defaultStandingGoals: [
      {
        id: "sg-canvas-due",
        title: "Surface Canvas work due in the next 48 hours",
        cadence: "Daily 7:30am",
      },
      {
        id: "sg-canvas-grades",
        title: "Flag new grades or feedback overnight",
        cadence: "Daily 8:00pm",
      },
    ],
  },
  {
    id: "gmail",
    name: "Gmail",
    category: "comms",
    detail: "Proactive inbox watch",
    description: "Ping when important mail lands. Mock inbox in this demo.",
    capabilities: ["read", "write", "watch"],
    implemented: true,
    actions: ["sync"],
    defaultStandingGoals: [
      {
        id: "sg-inbox",
        title: "Surface urgent customer emails before standup",
        cadence: "Weekdays 8:30am",
      },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    category: "comms",
    detail: "Notify on decisions",
    description: "Post updates when Dot needs you or finishes a thread.",
    capabilities: ["read", "write"],
    implemented: true,
    actions: ["sync"],
    defaultStandingGoals: [],
  },
  {
    id: "youtube",
    name: "YouTube",
    category: "content",
    detail: "Studio analytics",
    description: "Analyze channel performance via cloud computer + login.",
    capabilities: ["read"],
    implemented: true,
    actions: ["sync"],
    defaultStandingGoals: [
      {
        id: "sg-yt-weekly",
        title: "Weekly Studio check-in on the last 10 long-form videos",
        cadence: "Mondays 10:00am",
      },
    ],
  },
  {
    id: "notion",
    name: "Notion",
    category: "ops",
    detail: "Docs & briefs",
    description: "Park briefs and project notes in a workspace.",
    capabilities: ["read", "write"],
    implemented: true,
    actions: ["sync"],
    defaultStandingGoals: [],
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "money",
    detail: "Payments & MRR",
    description:
      "Watch payouts and failed charges. Add STRIPE_SECRET_KEY later for live mode.",
    capabilities: ["read", "watch"],
    envKeys: ["STRIPE_SECRET_KEY"],
    implemented: false,
    actions: ["sync"],
    defaultStandingGoals: [
      {
        id: "sg-stripe-failed",
        title: "Alert on failed charges and churn signals",
        cadence: "Continuous",
      },
    ],
  },
  {
    id: "upwork",
    name: "Upwork",
    category: "money",
    detail: "Freelance leads",
    description:
      "Shortlist jobs matching your skills and draft proposals for approval.",
    capabilities: ["read", "write", "watch"],
    implemented: false,
    actions: ["sync", "list_jobs"],
    defaultStandingGoals: [
      {
        id: "sg-upwork-leads",
        title: "Find 5 matching freelance jobs each weekday",
        cadence: "Weekdays 8:00am",
      },
    ],
  },
  {
    id: "calendar",
    name: "Google Calendar",
    category: "ops",
    detail: "Schedule & focus blocks",
    description: "Protect maker time and schedule review blocks from standing goals.",
    capabilities: ["read", "write", "watch"],
    envKeys: ["GOOGLE_CALENDAR_TOKEN"],
    implemented: false,
    actions: ["sync"],
    defaultStandingGoals: [
      {
        id: "sg-cal-focus",
        title: "Keep two daily focus blocks free for deep work",
        cadence: "Weekdays",
      },
    ],
  },
];

export function getPluginDef(id: string): PluginDefinition | undefined {
  return PLUGIN_CATALOG.find((p) => p.id === id);
}

export function liveModeAvailable(def: PluginDefinition): boolean {
  if (!def.envKeys?.length) return false;
  return def.envKeys.every((key) => Boolean(process.env[key]?.trim()));
}

export const CATEGORY_LABELS: Record<
  PluginDefinition["category"],
  string
> = {
  school: "School",
  code: "Build",
  money: "Money",
  comms: "Comms",
  content: "Content",
  ops: "Ops",
};
