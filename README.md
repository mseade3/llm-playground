# OpenDots — Miles Seade · Summer 2027

An [OpenDots](https://www.copilotkit.ai/opendots)-inspired always-on agent workspace personalized for **Miles Seade** (CS Eng @ UMich) preparing for **Summer 2027** software / cloud engineering internships.

Lead portfolio project: **AADE — Ann Arbor Digital Growth Engine** ([mseade3/Ann-Arbor-Automation](https://github.com/mseade3/Ann-Arbor-Automation)) — Maps/Places → SQLite → outreach → Streamlit + lead-priority ML.

Based on patterns in [CopilotKit/OpenDots](https://github.com/CopilotKit/OpenDots) — Spaces, multi-Dot specialists, computer tools, and human-in-the-loop cards — running as a local mock agent (no paid runtime required).

## Spaces (internship workstreams)

| Space | Purpose |
| --- | --- |
| **Portfolio** | Deepen AADE — architecture, metrics, honest limits |
| **Research** | Target SWE / cloud roles and companies for Summer 2027 |
| **Applications** | Wharton-style resume bullets, tracker, talking points |

## Dots

- **Scout** — research AADE evidence + role targets
- **Quill** — resume / portfolio narrative writer
- **Relay** — recruiter inbox + application tracking

## Features

- **Computer** — Browser, Files, Terminal tabs + Take over
- **Review cards** — Approve & save / Decline before writing to a Space
- **Plugin registry** — Canvas, GitHub, Gmail, and more (mock or live tokens)

## Design notes

- **Typography:** Self-hosted **Switzer** (Fontshare / Indian Type Foundry) — a free neo-grotesque that reads close to OpenAI docs’ Söhne / OpenAI Sans. Proprietary OpenAI Sans and Klim Söhne are not freely redistributable, so Switzer is the legal webfont stand-in applied across body, headings, and nav.
- **Atmosphere:** A GPU-friendly CSS “river” light field (transform/opacity bands + soft caustics) behind onboarding and the workspace shell. Honors `prefers-reduced-motion: reduce`.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional live tokens
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

## Try the internship demo flow

1. Create Scout (Quill + Relay join automatically)
2. Ask: *Review the AADE README metrics, draft portfolio talking points for Summer 2027 SWE internships, and save notes to Applications.*
3. Watch browser → file → terminal actions inline
4. **Approve & save** the review card into Applications
5. Open the **Applications** Space to read the saved page

## Plugins

| Plugin | Status | Live env |
| --- | --- | --- |
| Canvas | mock/live | `CANVAS_BASE_URL`, `CANVAS_API_TOKEN` |
| GitHub | mock/live | `GITHUB_TOKEN` (defaults to `mseade3/Ann-Arbor-Automation`) |
| Gmail / Slack / YouTube | mock | — |

State lives in `.data/workspace.json` (gitignored). Use **Settings → Reset** to start over.

## Sources used for personalization

- Cursor user preferences (`ann-arbor-automated` lead project, Wharton-style resume)
- Public GitHub profile [mseade3](https://github.com/mseade3) + AADE README
- Owner identity: Miles Seade · mseade@umich.edu

No single employer is claimed as fact — this is framed as Miles’s internship **project workspace**.
