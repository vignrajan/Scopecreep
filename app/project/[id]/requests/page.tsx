import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { RequestInput } from "@/components/requests/RequestInput";
import { RequestItem } from "@/components/requests/RequestItem";
import { Card, CardContent } from "@/components/ui/card";
import type { Project, ScopeRequest } from "@/types";

export default async function RequestsPage({
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
    .select("hourly_rate, currency")
    .eq("id", user.id)
    .single();
  const defaultRate = profile?.hourly_rate ?? 100;
  const currency = profile?.currency ?? "USD";

  const { data: requests } = await supabase
    .from("scope_requests")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const list = (requests ?? []) as ScopeRequest[];

  return (
    <div className="space-y-6">
      <ProjectHeader project={p} active="requests" />
      <RequestInput projectId={id} />

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No requests yet. Paste what your client asked for above and let ScopeLock classify it.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((r) => (
            <RequestItem
              key={r.id}
              request={r}
              projectId={id}
              currency={currency}
              defaultRate={defaultRate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
