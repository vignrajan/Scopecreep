import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ClientUpdateEditor } from "@/components/project/ClientUpdateEditor";
import { RequestAnalysisBadge } from "@/components/requests/RequestAnalysisBadge";
import { ChangeOrderStatusBadge } from "@/components/change-orders/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ChangeOrder, Project, ScopeRequest } from "@/types";

export default async function ProjectOverview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (!project) notFound();
  const p = project as Project;

  const { data: profile } = await supabase
    .from("users")
    .select("currency")
    .eq("id", user.id)
    .single();
  const currency = profile?.currency ?? "USD";

  const { data: requests } = await supabase
    .from("scope_requests")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: orders } = await supabase
    .from("change_orders")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const orderList = (orders ?? []) as ChangeOrder[];
  const signed = orderList.filter((o) => o.status === "signed");
  const extraHours = signed.reduce((s, o) => s + Number(o.hours), 0);

  return (
    <div className="space-y-8">
      <ProjectHeader project={p} active="overview" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Extra hours approved" value={String(extraHours)} />
        <Stat
          label="Extra revenue approved"
          value={formatCurrency(p.total_approved_extras, currency)}
        />
        <Stat label="Change orders" value={String(orderList.length)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Original scope</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{p.original_scope}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ClientUpdateEditor projectId={p.id} initial={p.client_update} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent requests</CardTitle>
            <Link href={`/project/${id}/requests`} className="text-sm font-medium text-primary">
              View all →
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {(requests ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests logged yet.</p>
            ) : (
              (requests as ScopeRequest[]).map((r) => (
                <div key={r.id} className="flex items-start justify-between gap-3">
                  <p className="line-clamp-2 text-sm">{r.content}</p>
                  <RequestAnalysisBadge verdict={r.ai_verdict} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Change orders</CardTitle>
            <Link
              href={`/project/${id}/change-orders`}
              className="text-sm font-medium text-primary"
            >
              View all →
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {orderList.length === 0 ? (
              <p className="text-sm text-muted-foreground">No change orders yet.</p>
            ) : (
              orderList.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm">{o.title}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatCurrency(Number(o.total), currency)}
                    </span>
                    <ChangeOrderStatusBadge status={o.status} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xl font-semibold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
