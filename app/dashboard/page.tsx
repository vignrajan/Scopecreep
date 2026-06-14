import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { ProjectCard } from "@/components/project/ProjectCard";
import { NewProjectButton } from "@/components/project/NewProjectButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { planConfig } from "@/lib/plans";
import type { Plan, Project } from "@/types";
import { FolderPlus, Download } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("plan, currency")
    .eq("id", user.id)
    .single();
  const plan: Plan = (profile?.plan as Plan) ?? "free";
  const currency = profile?.currency ?? "USD";

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const list = (projects ?? []) as Project[];
  const projectIds = list.map((p) => p.id);
  const activeCount = list.filter((p) => p.status === "active").length;
  const totalExtraRevenue = list.reduce((s, p) => s + Number(p.total_approved_extras), 0);

  // Extra hours approved = sum of hours across signed change orders.
  let totalExtraHours = 0;
  if (projectIds.length) {
    const { data: signed } = await supabase
      .from("change_orders")
      .select("hours")
      .in("project_id", projectIds)
      .eq("status", "signed");
    totalExtraHours = (signed ?? []).reduce((s, o) => s + Number(o.hours), 0);
  }

  const cap = planConfig(plan).maxActiveProjects;
  const canCreate = cap === null || activeCount < cap;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            {planConfig(plan).name} plan
            {cap !== null ? ` · ${activeCount}/${cap} active` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {totalExtraHours > 0 && (
            <Button asChild variant="outline" className="cursor-pointer">
              <a href="/api/export/change-orders" download>
                <Download className="h-4 w-4" /> Export CSV
              </a>
            </Button>
          )}
          <NewProjectButton canCreate={canCreate} />
        </div>
      </div>

      <StatsBar
        activeProjects={activeCount}
        totalExtraHours={totalExtraHours}
        totalExtraRevenue={totalExtraRevenue}
        currency={currency}
      />

      {list.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <FolderPlus className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">No projects yet</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Create your first project and set its original scope. Then start logging the requests
              your client throws at you.
            </p>
            <div className="pt-2">
              <NewProjectButton canCreate={canCreate} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProjectCard key={p.id} project={p} currency={currency} />
          ))}
        </div>
      )}

      {!canCreate && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
            <p className="text-sm">
              You&apos;ve hit your plan&apos;s active project limit.
            </p>
            <Link href="/dashboard/billing" className="text-sm font-medium text-primary">
              Upgrade to Pro for unlimited projects →
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
