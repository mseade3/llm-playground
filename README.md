# OpenDots workspace

An [OpenDots](https://www.copilotkit.ai/opendots)-inspired always-on agent workspace built with Next.js. Specialist Dots (Scout, Quill, Relay) share **Spaces**, work on a persistent **Computer** (browser / files / terminal), and pause for **review-before-save**.

Based on the patterns in [CopilotKit/OpenDots](https://github.com/CopilotKit/OpenDots) — Spaces, multi-Dot specialists, computer tools, and human-in-the-loop cards — running as a local mock agent (no Node 24 / OpenBot requirement).

## Features

- **Spaces** — Launch & Research document homes; approved drafts become pages
- **Dots** — Scout (research), Quill (writer), Relay (comms) with per-Dot permissions
- **Computer** — Browser, Files, Terminal tabs + Take over
- **Review cards** — Approve & save / Decline before writing to a Space
- **Plugin registry** — Canvas, GitHub, Gmail, and more (mock or live tokens)

## Run locally

```bash
npm install
cp .env.example .env.local   # optional live tokens
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

## Try the OpenDots flow

1. Create Scout (Quill + Relay join automatically)
2. Ask: *Open Acme's Agents SDK announcement, summarize what they shipped, and save notes I can use in the launch brief.*
3. Watch browser → file → terminal actions inline
4. **Approve & save** the review card into Launch
5. Open the **Launch** Space to read the saved page

## Plugins

| Plugin | Status | Live env |
| --- | --- | --- |
| Canvas | mock/live | `CANVAS_BASE_URL`, `CANVAS_API_TOKEN` |
| GitHub | mock/live | `GITHUB_TOKEN` |
| Gmail / Slack / YouTube | mock | — |

State lives in `.data/workspace.json` (gitignored). Use **Settings → Reset** to start over.
