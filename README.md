# Dot — always-on agent workspace

A Dots-inspired demo shaped by OpenAI’s DevDay “Alfred” pattern: name your agent, watch it work on a cloud computer, pause for write/PR approvals, and keep standing goals alive between chats.

## What’s in the demo

- **Create your Dot** — name + bubbly avatar (like Alfred)
- **DevDay coding flow** — retire an inventory API: trace deps → update integrations → run tests → open PRs
- **Approvals + custom rules** — Allow / Ask / Block for reads, tests, PRs, outbound mail
- **Connected apps** — GitHub, Slack, Gmail, Notion toggles
- **Standing goals** — continuous watches that flip to “acting” when work starts
- **Cloud computer** — Take over / Return control
- **Memory** — preferences that persist in `.data/`

No API keys required.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

## Try these prompts

1. **Remove the old inventory API before it gets shut down.** (primary DevDay-style demo)
2. Research three competitors for a neighborhood coffee shop and draft a one-page brief.
3. Pull overdue invoices and draft polite follow-up emails.

## Notes

- Workspace state is stored in `.data/workspace.json` (gitignored).
- Use **Reset** to return to the Create your Dot screen.
