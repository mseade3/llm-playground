# Dot — always-on agent workspace

A Dots-inspired demo: chat with an always-on agent that keeps working in the background, remembers preferences, pauses for write approvals, and runs on a simulated cloud computer you can take over.

## Features

- **Chat + goals** — hand Dot a project; it plans multi-step work
- **Background tasks** — steps keep running between messages (server-side)
- **Approvals** — write actions pause until you approve or reject
- **Cloud computer** — watch browser tabs/logs; **Take over** / **Return control**
- **Memory** — preferences and project notes persist across sessions (local `.data/`)

No API keys required — the agent uses a built-in planner for demo scenarios (coffee shop brief, invoice follow-ups, launch checklist, plus a generic path).

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server on port `43127` |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |

## Try these prompts

- Research three competitors for a neighborhood coffee shop and draft a one-page brief.
- Pull overdue invoices and draft polite follow-up emails.
- Build a product launch checklist I can reuse.

## Notes

- Workspace state is stored in `.data/workspace.json` (gitignored).
- Use **Reset** in the header to clear chat, tasks, and memory back to defaults.
