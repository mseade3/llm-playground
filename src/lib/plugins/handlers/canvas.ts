import type { PluginActionResult, PluginMode } from "../types";

function mockAssignments(): PluginActionResult["items"] {
  const soon = new Date(Date.now() + 36 * 3600 * 1000).toISOString();
  const week = new Date(Date.now() + 5 * 86400 * 1000).toISOString();
  return [
    {
      id: "asg-183",
      title: "Project checkpoint — Elevators follow-ups",
      subtitle: "EECS 183 · Elementary Programming Concepts",
      due: soon,
      url: "https://umich.instructure.com/courses/183/assignments/1831",
      meta: { points: "25", status: "not_submitted" },
    },
    {
      id: "asg-140",
      title: "Physics 140 — problem set 6",
      subtitle: "PHYSICS 140 · General Physics I",
      due: soon,
      url: "https://umich.instructure.com/courses/140/assignments/1406",
      meta: { points: "40", status: "not_submitted" },
    },
    {
      id: "asg-career",
      title: "Career center — internship prep workshop",
      subtitle: "UMich Career Center · optional",
      due: week,
      url: "https://careercenter.umich.edu",
      meta: { points: "0", status: "registered" },
    },
  ];
}

function mockCourses(): PluginActionResult["items"] {
  return [
    {
      id: "c-183",
      title: "EECS 183 — Elementary Programming Concepts",
      subtitle: "UMich · active",
    },
    {
      id: "c-140",
      title: "PHYSICS 140 — General Physics I",
      subtitle: "UMich · active",
    },
    {
      id: "c-career",
      title: "Career prep — Summer 2027 internships",
      subtitle: "Standing goal · AADE portfolio depth",
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
1. Finish EECS checkpoint outline (40m)
2. Physics problem set block (50m)
3. Protect 45m for AADE portfolio depth tonight`,
  };
}
