import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ChangeOrderCard } from "@/components/change-orders/ChangeOrderCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";
import { planConfig } from "@/lib/plans";
import type { ChangeOrder, Plan, Project } from "@/types";

export default async function ChangeOrdersPage({
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
    .select("full_name, currency, plan")
    .eq("id", user.id)
    .single();
  const currency = profile?.currency ?? "USD";
  const plan: Plan = (profile?.plan as Plan) ?? "free";
  const canSend = planConfig(plan).clientESign;

  const { data: orders } = await supabase
    .from("change_orders")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const list = (orders ?? []) as ChangeOrder[];
  const signedCount = list.filter((o) => o.status === "signed").length;

  return (
    <div className="space-y-6">
      <ProjectHeader project={p} active="change-orders" />

      {!canSend && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between gap-3 py-4">
            <p className="text-sm">
              Sending change orders for client e-signature is a Pro feature.
            </p>
            <Link href="/dashboard/billing" className="shrink-0 text-sm font-medium text-primary">
              Upgrade →
            </Link>
          </CardContent>
        </Card>
      )}

      {signedCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {signedCount} approved change order{signedCount === 1 ? "" : "s"} ready to invoice.
          </p>
          <Button asChild variant="outline" size="sm" className="cursor-pointer">
            <a href={`/api/export/change-orders?projectId=${id}`} download>
              <Download className="h-4 w-4" /> Export CSV
            </a>
          </Button>
        </div>
      )}

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No change orders yet. Create one from an out-of-scope request on the{" "}
            <Link href={`/project/${id}/requests`} className="font-medium text-primary">
              Requests
            </Link>{" "}
            tab.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((o) => (
            <ChangeOrderCard
              key={o.id}
              order={o}
              projectName={p.name}
              freelancerName={profile?.full_name ?? "Your freelancer"}
              currency={currency}
              hasClientEmail={!!p.client_email}
              canSend={canSend}
            />
          ))}
        </div>
      )}
    </div>
  );
}
