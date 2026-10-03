import type { PluginActionResult, PluginMode } from "../types";

type GithubConfig = {
  owner?: string;
  repo?: string;
};

function mockIssues(owner: string, repo: string): PluginActionResult["items"] {
  return [
    {
      id: "iss-214",
      title: "Inventory v1 callers still hitting /v1 in admin",
      subtitle: `${owner}/${repo} · bug · P1`,
      url: `https://github.com/${owner}/${repo}/issues/214`,
      meta: { labels: "bug,p1", comments: "3" },
    },
    {
      id: "iss-219",
      title: "Add webhook retry for stock sync failures",
      subtitle: `${owner}/${repo} · enhancement`,
      url: `https://github.com/${owner}/${repo}/issues/219`,
      meta: { labels: "enhancement", comments: "1" },
    },
    {
      id: "iss-221",
      title: "Docs: document gateway migration for partners",
      subtitle: `${owner}/${repo} · docs`,
      url: `https://github.com/${owner}/${repo}/issues/221`,
      meta: { labels: "docs", comments: "0" },
    },
  ];
}

function mockPrs(owner: string, repo: string): PluginActionResult["items"] {
  return [
    {
      id: "pr-841",
      title: "chore(checkout): migrate inventory client to /v2",
      subtitle: `${owner}/${repo} · ready · CI green`,
      url: `https://github.com/${owner}/${repo}/pull/841`,
      meta: { status: "ready" },
    },
    {
      id: "pr-843",
      title: "chore(admin): remove inventory v1 debug panel",
      subtitle: `${owner}/${repo} · draft`,
      url: `https://github.com/${owner}/${repo}/pull/843`,
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
  const owner = config.owner || process.env.GITHUB_OWNER || "acme";
  const repo = config.repo || process.env.GITHUB_REPO || "commerce";
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
      .join("\n")}\n\n## Suggested behind-the-scenes work\n1. Draft a fix for the P1 inventory callers\n2. Open a docs PR for partner migration\n3. Ask before merging anything`,
  };
}
