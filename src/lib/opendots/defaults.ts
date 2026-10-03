import { randomUUID } from "crypto";
import type {
  ComputerFile,
  Space,
  SpacePage,
  SpecialistDot,
  TerminalLine,
} from "./types";

export const DEFAULT_SPACES: Space[] = [
  { id: "space-launch", name: "Launch" },
  { id: "space-research", name: "Research" },
];

export function defaultDots(): SpecialistDot[] {
  const now = new Date().toISOString();
  return [
    {
      id: "dot-scout",
      name: "Scout",
      role: "Researcher",
      instructions:
        "Research announcements and docs on the computer. Summarize clearly and save notes to Spaces after approval.",
      tone: "coral",
      icon: "scout",
      permissions: ["browser", "files", "shell", "memory"],
      defaultSpaceId: "space-launch",
      lastActivity: "Ready for research",
      lastActivityAt: now,
    },
    {
      id: "dot-quill",
      name: "Quill",
      role: "Writer",
      instructions:
        "Turn research into launch briefs and polished drafts. Prefer short, punchy copy.",
      tone: "violet",
      icon: "quill",
      permissions: ["files", "memory"],
      defaultSpaceId: "space-launch",
      lastActivity: "Revised the launch brief opening",
      lastActivityAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
    {
      id: "dot-relay",
      name: "Relay",
      role: "Comms",
      instructions:
        "Answer in Slack-style channels, triage inbox noise, and keep Launch updated.",
      tone: "sky",
      icon: "relay",
      permissions: ["browser", "memory"],
      defaultSpaceId: "space-launch",
      lastActivity: "Answered in #launch",
      lastActivityAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
  ];
}

export function defaultPages(): SpacePage[] {
  const now = new Date().toISOString();
  return [
    {
      id: "page-launch-brief",
      spaceId: "space-launch",
      title: "Launch brief",
      body: `# Launch brief

## Positioning
Own the weekday focus cafe for builders shipping always-on agents.

## Open questions
- How do we contrast hosted runtimes vs local computers?
- What proof points from the Agents SDK announcement land in week one?`,
      createdAt: now,
      updatedAt: now,
      editedBy: "you",
    },
    {
      id: "page-research-notes",
      spaceId: "space-research",
      title: "Competitive notes",
      body: `# Competitive notes

Acme Agents SDK — hosted runtime, tool calling, traces.
OpenDots — specialist Dots, Spaces, and a persistent computer.`,
      createdAt: now,
      updatedAt: now,
      savedByDotId: "dot-scout",
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
  ];
}

export function defaultTerminal(): TerminalLine[] {
  return [
    {
      id: randomUUID(),
      command: "whoami",
      output: "scout",
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
