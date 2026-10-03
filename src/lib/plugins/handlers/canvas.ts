import type { PluginActionResult, PluginMode } from "../types";

function mockAssignments(): PluginActionResult["items"] {
  const soon = new Date(Date.now() + 36 * 3600 * 1000).toISOString();
  const week = new Date(Date.now() + 5 * 86400 * 1000).toISOString();
  return [
    {
      id: "asg-881",
      title: "Lab 4 — Dependency graphs",
      subtitle: "CS 320 · Software Engineering",
      due: soon,
      url: "https://canvas.example.edu/courses/320/assignments/881",
      meta: { points: "40", status: "not_submitted" },
    },
    {
      id: "asg-902",
      title: "Reading response: Always-on agents",
      subtitle: "HCI 210 · Design Futures",
      due: soon,
      url: "https://canvas.example.edu/courses/210/assignments/902",
      meta: { points: "10", status: "not_submitted" },
    },
    {
      id: "asg-915",
      title: "Milestone 2 — Product brief",
      subtitle: "ENT 401 · Venture Studio",
      due: week,
      url: "https://canvas.example.edu/courses/401/assignments/915",
      meta: { points: "100", status: "drafted" },
    },
  ];
}

function mockCourses(): PluginActionResult["items"] {
  return [
    {
      id: "c-320",
      title: "CS 320 — Software Engineering",
      subtitle: "Spring · active",
    },
    {
      id: "c-210",
      title: "HCI 210 — Design Futures",
      subtitle: "Spring · active",
    },
    {
      id: "c-401",
      title: "ENT 401 — Venture Studio",
      subtitle: "Spring · active",
    },
  ];
}

async function liveListAssignments(
  baseUrl: string,
  token: string,
): Promise<PluginActionResult> {
  const url = `${baseUrl.replace(/\/$/, "")}/api/v1/users/self/upcoming_events?per_page=20`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    return {
      ok: false,
      mode: "live",
      summary: `Canvas API error ${res.status}`,
      error: await res.text(),
    };
  }
  const data = (await res.json()) as Array<{
    id: number | string;
    title: string;
    html_url?: string;
    start_at?: string;
    assignment?: { points_possible?: number; course_id?: number };
    context_name?: string;
  }>;
  const items = data.map((e) => ({
    id: String(e.id),
    title: e.title,
    subtitle: e.context_name,
    due: e.start_at,
    url: e.html_url,
    meta: {
      points: String(e.assignment?.points_possible ?? ""),
    },
  }));
  return {
    ok: true,
    mode: "live",
    summary: `Synced ${items.length} upcoming Canvas items.`,
    items,
    artifact: `# Canvas upcoming\n\n${items
      .map(
        (i) =>
          `- **${i.title}**${i.due ? ` · due ${new Date(i.due).toLocaleString()}` : ""}`,
      )
      .join("\n")}`,
  };
}

export async function runCanvasAction(
  action: string,
  mode: PluginMode,
): Promise<PluginActionResult> {
  const baseUrl = process.env.CANVAS_BASE_URL?.trim();
  const token = process.env.CANVAS_API_TOKEN?.trim();

  if (mode === "live" && baseUrl && token) {
    if (action === "list_assignments" || action === "sync") {
      return liveListAssignments(baseUrl, token);
    }
  }

  if (action === "list_courses") {
    const items = mockCourses() ?? [];
    return {
      ok: true,
      mode: "mock",
      summary: `Found ${items.length} active courses (mock).`,
      items,
    };
  }

  const items = mockAssignments() ?? [];
  const dueSoon = items.filter(
    (i) => i.due && new Date(i.due).getTime() - Date.now() < 48 * 3600 * 1000,
  );
  return {
    ok: true,
    mode: "mock",
    summary: `Synced ${items.length} assignments — ${dueSoon.length} due within 48h (mock). Set CANVAS_BASE_URL + CANVAS_API_TOKEN for live mode.`,
    items,
    artifact: `# Canvas — next 48 hours (mock)

${dueSoon
  .map(
    (i) =>
      `- **${i.title}** (${i.subtitle}) · due ${i.due ? new Date(i.due).toLocaleString() : "TBD"}`,
  )
  .join("\n")}

## Study plan Dot can run behind the scenes
1. Outline Lab 4 dependency-graph solution (45m)
2. Draft HCI reading response from notes (25m)
3. Ping you tonight if either is still unsubmitted`,
  };
}
