# Dot — always-on agent workspace

Dark-themed Dots-inspired agent with a **plugin registry** for life surfaces (Canvas, GitHub, Gmail, money stubs, and more). Connect plugins, enable standing goals, sync mock or live APIs, and let Dot work behind the scenes.

## Plugin registry

| Plugin | Category | Status | Live env |
| --- | --- | --- | --- |
| Canvas | School | Implemented (mock/live) | `CANVAS_BASE_URL`, `CANVAS_API_TOKEN` |
| GitHub | Build | Implemented (mock/live) | `GITHUB_TOKEN` (+ optional `GITHUB_OWNER`, `GITHUB_REPO`) |
| Gmail / Slack / YouTube / Notion | Comms/Content/Ops | Implemented (mock) | — |
| Stripe / Upwork / Calendar | Money/Ops | Catalog stubs | see `.env.example` |

**How to add another life surface**
1. Add a row to `src/lib/plugins/registry.ts`
2. Add a handler in `src/lib/plugins/handlers/`
3. Register it in `handlers/index.ts`
4. (Optional) add an agent plan in `src/lib/agent.ts`

Standing goals ship with each plugin and toggle on connect.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional live tokens
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

## Try

1. Create Winston with Canvas + GitHub checked
2. Open the **Plug** tab → Sync Canvas / GitHub
3. Chat: **Check Canvas for what's due** or **Triage my GitHub issues**
4. Enable standing goals per plugin for behind-the-scenes watching

## Notes

- Without tokens, plugins run in **mock** mode so the demo always works.
- State: `.data/workspace.json` (gitignored). **Reset** clears to Create your Dot.
