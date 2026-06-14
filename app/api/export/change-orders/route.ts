import { createClient } from "@/lib/supabase/server";

/** RFC-4180-safe CSV cell. */
function csv(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Exports APPROVED (signed) change orders as CSV for invoicing.
 * Optional `?projectId=` scopes to one project; otherwise all of the user's.
 * RLS restricts rows to the authenticated user's own projects.
 */
export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const projectId = new URL(req.url).searchParams.get("projectId");

  let query = supabase
    .from("change_orders")
    .select(
      "co_number, title, hours, rate, total, status, client_signed_at, created_at, projects!inner(name, client_name)",
    )
    .eq("status", "signed")
    .order("created_at", { ascending: true });

  if (projectId) query = query.eq("project_id", projectId);

  const { data, error } = await query;
  if (error) {
    return new Response("Could not export", { status: 500 });
  }

  const header = [
    "Project",
    "Client",
    "CO #",
    "Title",
    "Hours",
    "Rate",
    "Total",
    "Status",
    "Signed date",
  ];

  const rows = (data ?? []).map((o) => {
    const project = o.projects as unknown as { name: string; client_name: string | null };
    return [
      project?.name ?? "",
      project?.client_name ?? "",
      o.co_number ?? "",
      o.title,
      o.hours,
      o.rate,
      o.total,
      o.status,
      o.client_signed_at ? new Date(o.client_signed_at).toISOString().slice(0, 10) : "",
    ];
  });

  const body = [header, ...rows].map((r) => r.map(csv).join(",")).join("\r\n");
  const filename = projectId
    ? "scopelock-change-orders-project.csv"
    : "scopelock-change-orders.csv";

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
