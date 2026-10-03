import { randomUUID } from "crypto";
import type {
  ComputerFile,
  Space,
  SpacePage,
  SpecialistDot,
  TerminalLine,
} from "./types";

/** Miles Seade — Summer 2027 internship prep workstreams */
export const DEFAULT_SPACES: Space[] = [
  { id: "space-portfolio", name: "Portfolio" },
  { id: "space-research", name: "Research" },
  { id: "space-apps", name: "Applications" },
];

export function defaultDots(): SpecialistDot[] {
  const now = new Date().toISOString();
  return [
    {
      id: "dot-scout",
      name: "Scout",
      role: "Researcher",
      instructions:
        "Research SWE/cloud internship targets and deepen AADE (Ann Arbor Digital Growth Engine) evidence — metrics, architecture, honest limits. Summarize clearly and save to Spaces after approval.",
      tone: "coral",
      icon: "scout",
      permissions: ["browser", "files", "shell", "memory"],
      defaultSpaceId: "space-research",
      lastActivity: "Ready for internship research",
      lastActivityAt: now,
    },
    {
      id: "dot-quill",
      name: "Quill",
      role: "Writer",
      instructions:
        "Turn AADE depth and project metrics into Wharton-style resume bullets, portfolio narratives, and concise application copy. Prefer specificity over buzzwords.",
      tone: "amber",
      icon: "quill",
      permissions: ["files", "memory"],
      defaultSpaceId: "space-apps",
      lastActivity: "Drafted AADE resume bullets",
      lastActivityAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
    {
      id: "dot-relay",
      name: "Relay",
      role: "Comms",
      instructions:
        "Track internship outreach, recruiter replies, and application deadlines. Keep Applications updated and nudge Miles before due dates.",
      tone: "sky",
      icon: "relay",
      permissions: ["browser", "memory"],
      defaultSpaceId: "space-apps",
      lastActivity: "Logged a recruiter follow-up",
      lastActivityAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
  ];
}

export function defaultPages(): SpacePage[] {
  const now = new Date().toISOString();
  return [
    {
      id: "page-aade-depth",
      spaceId: "space-portfolio",
      title: "AADE depth plan",
      body: `# AADE — Ann Arbor Digital Growth Engine

**Repo:** [mseade3/Ann-Arbor-Automation](https://github.com/mseade3/Ann-Arbor-Automation)  
**Owner:** Miles Seade · CS Eng @ UMich · Summer 2027 internship lead project

## Pipeline
Maps/Places discovery → SQLite → outreach + mockups → Streamlit ops · plus proxy-labeled lead-priority ML (LR + RF).

## Depth goals (portfolio signal)
- Keep SYSTEMS tradeoffs + honest limits front-and-center
- Reproduce lead-scorer holdout metrics and bench throughput
- Ship one visible before/after: scrape → scored lead → outreach draft

## Open questions
- Which niche (e.g. landscapers) tells the best demo story?
- How do we frame proxy labels vs real conversion without overclaiming?`,
      createdAt: now,
      updatedAt: now,
      editedBy: "you",
    },
    {
      id: "page-target-roles",
      spaceId: "space-research",
      title: "Target roles — Summer 2027",
      body: `# Target roles — Summer 2027

Miles is pursuing **software & cloud engineering** internships for Summer 2027 (Wharton-style one-pager resume).

## Role themes
- Software engineering (full-stack / backend)
- Applied AI / ML systems (pipelines, eval, not hype)
- Cloud / platform engineering

## Proof points to lead with
1. **AADE** — SMB Maps→SQLite→outreach + measured lead ML
2. **heads-notes** — Whisper→GPT meeting notes + offline eval
3. **summer-automation** — Twilio SMS lead engine + intent eval
4. **ai-disease-detection-rebuild** — owned sklearn practicum rebuild

## Notes
No single employer is locked yet — treat this Space as role/company research, not a fake offer narrative.`,
      createdAt: now,
      updatedAt: now,
      savedByDotId: "dot-scout",
    },
    {
      id: "page-app-tracker",
      spaceId: "space-apps",
      title: "Application tracker",
      body: `# Application tracker

| Company / role | Status | Next step | Notes |
| --- | --- | --- | --- |
| _(add targets)_ | researching | draft bullets from AADE | Lead with pipeline + ML metrics |
| | | | |

## Resume checklist
- Wharton-style one-pager
- Quantify AADE (throughput, F1, holdout size)
- Link GitHub: mseade3 · LinkedIn: miles-seade
- Email: mseade@umich.edu`,
      createdAt: now,
      updatedAt: now,
      editedBy: "you",
    },
  ];
}

export function defaultComputerFiles(): ComputerFile[] {
  return [
    {
      path: "~/notes/.keep",
      sizeLabel: "0 B",
      content: "",
      updatedAt: new Date().toISOString(),
    },
    {
      path: "~/notes/aade-portfolio.md",
      sizeLabel: "0.4 KB",
      content: `# AADE portfolio scratch

Lead project for Miles Seade · Summer 2027 internship apps.
Maps/Places → SQLite → outreach → Streamlit + lead-priority ML.`,
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function defaultTerminal(): TerminalLine[] {
  return [
    {
      id: randomUUID(),
      command: "whoami",
      output: "miles",
      createdAt: new Date().toISOString(),
    },
  ];
}

export function spacePageCount(
  pages: SpacePage[],
  spaceId: string,
): number {
  return pages.filter((p) => p.spaceId === spaceId).length;
}
