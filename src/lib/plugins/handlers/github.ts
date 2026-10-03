import type { PluginActionResult, PluginMode } from "../types";

type GithubConfig = {
  owner?: string;
  repo?: string;
};

function mockIssues(owner: string, repo: string): PluginActionResult["items"] {
  return [
    {
      id: "iss-12",
      title: "Docs: sync SYSTEMS.md honest-limits with README metrics",
      subtitle: `${owner}/${repo} · docs · P2`,
      url: `https://github.com/${owner}/${repo}/issues/12`,
      meta: { labels: "docs,portfolio", comments: "1" },
    },
    {
      id: "iss-14",
      title: "ml: export feature_importance.csv in train_lead_scorer summary",
      subtitle: `${owner}/${repo} · enhancement`,
      url: `https://github.com/${owner}/${repo}/issues/14`,
      meta: { labels: "ml,enhancement", comments: "0" },
    },
    {
      id: "iss-15",
      title: "Scraper: prefer Places path when GOOGLE_PLACES_API_KEY is set",
      subtitle: `${owner}/${repo} · reliability`,
      url: `https://github.com/${owner}/${repo}/issues/15`,
      meta: { labels: "scraper", comments: "2" },
    },
  ];
}

function mockPrs(owner: string, repo: string): PluginActionResult["items"] {
  return [
    {
      id: "pr-22",
      title: "docs: tighten AADE architecture diagram for internship narrative",
      subtitle: `${owner}/${repo} · ready · CI green`,
      url: `https://github.com/${owner}/${repo}/pull/22`,
      meta: { status: "ready" },
    },
    {
      id: "pr-23",
      title: "ml: add bench_pipeline.json to artifacts README table",
      subtitle: `${owner}/${repo} · draft`,
      url: `https://github.com/${owner}/${repo}/pull/23`,
      meta: { status: "draft" },
    },
  ];
}

async function liveListIssues(
  owner: string,
  repo: string,
  token: string,
): Promise<PluginActionResult> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=10`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "dot-agent",
      },
      cache: "no-store",
    },
  );
  if (!res.ok) {
    return {
      ok: false,
      mode: "live",
      summary: `GitHub API error ${res.status}`,
      error: await res.text(),
    };
  }
  const data = (await res.json()) as Array<{
    id: number;
    number: number;
    title: string;
    html_url: string;
    pull_request?: unknown;
    labels?: Array<{ name: string }>;
    comments: number;
  }>;
  const issues = data.filter((i) => !i.pull_request);
  return {
    ok: true,
    mode: "live",
    summary: `Synced ${issues.length} open issues from ${owner}/${repo}.`,
    items: issues.map((i) => ({
      id: String(i.id),
      title: i.title,
      subtitle: `${owner}/${repo} · #${i.number}`,
      url: i.html_url,
      meta: {
        labels: (i.labels ?? []).map((l) => l.name).join(", "),
        comments: String(i.comments),
      },
    })),
    artifact: `# GitHub issues — ${owner}/${repo}\n\n${issues
      .map((i) => `- [#${i.number}](${i.html_url}) ${i.title}`)
      .join("\n")}`,
  };
}

export async function runGithubAction(
  action: string,
  mode: PluginMode,
  config: GithubConfig = {},
): Promise<PluginActionResult> {
  const owner = config.owner || process.env.GITHUB_OWNER || "mseade3";
  const repo =
    config.repo || process.env.GITHUB_REPO || "Ann-Arbor-Automation";
  const token = process.env.GITHUB_TOKEN?.trim();

  if (mode === "live" && token) {
    if (action === "list_issues" || action === "sync") {
      return liveListIssues(owner, repo, token);
    }
  }

  // Mock path (default) — always works offline
  if (action === "list_prs") {
    const items = mockPrs(owner, repo) ?? [];
    return {
      ok: true,
      mode: "mock",
      summary: `Found ${items.length} pull requests in ${owner}/${repo} (mock).`,
      items,
      artifact: `# GitHub PRs — ${owner}/${repo} (mock)\n\n${items
        .map((i) => `- ${i.title}`)
        .join("\n")}`,
    };
  }

  const items = mockIssues(owner, repo) ?? [];
  return {
    ok: true,
    mode: "mock",
    summary: `Synced ${items.length} open issues from ${owner}/${repo} (mock). Add GITHUB_TOKEN for live mode.`,
    items,
    artifact: `# GitHub issues — ${owner}/${repo} (mock)\n\n${items
      .map((i) => `- ${i.title} — ${i.subtitle}`)
      .join(
        "\n",
      )}\n\n## Suggested behind-the-scenes work\n1. Docs PR for SYSTEMS.md ↔ README metrics sync\n2. Export feature importance in train summary\n3. Ask before merging anything`,
  };
}
