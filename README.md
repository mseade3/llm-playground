# Dot — always-on agent workspace

A dark-themed, Dots-inspired demo: name your agent, orchestrate Codex-style threads, handle login takeovers, get proactive inbox pings, and approve PRs — patterns from OpenAI DevDay + early-access walkthroughs.

## What’s in the demo

- **Dark charcoal + teal** UI
- **Create your Dot** — name, avatar, plugin connect (Gmail / YouTube)
- **Orchestration threads** — click worker threads Dot spins up
- **Proactivity** — quiet / balanced / high (Profile or “be quieter”)
- **Auth takeover** — YouTube Studio login + 2FA handoff
- **DevDay coding flow** — retire inventory API → open PRs
- **Comparison site flow** — Dots vs Muse vs Grokbot via a Soul worker
- **Custom rules**, connected apps, standing goals, cloud computer

No API keys required.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

## Try these prompts

1. **Build a Dots vs Muse vs Grokbot comparison site.**
2. **Analyze my last 10 YouTube videos in Studio.** (finish auth when prompted)
3. **Remove the old inventory API before it gets shut down.**
4. **Be quieter** / **be more proactive**

## Notes

- State lives in `.data/workspace.json` (gitignored).
- **Reset** returns to Create your Dot.
