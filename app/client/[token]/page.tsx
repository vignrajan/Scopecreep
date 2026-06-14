import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import type { ChangeOrder, Project } from "@/types";

export const dynamic = "force-dynamic";

export default async function ClientProjectPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const svc = createServiceClient();

  const { data: project } = await svc
    .from("projects")
    .select("id, name, status, client_update, user_id")
    .eq("public_token", token)
    .single();
  if (!project) notFound();
  const p = project as Pick<Project, "id" | "name" | "status" | "client_update" | "user_id">;

  const { data: owner } = await svc
    .from("users")
    .select("full_name, currency")
    .eq("id", p.user_id)
    .single();
  const currency = owner?.currency ?? "USD";

  // Transparency log: ONLY signed change orders are shown. Pending, draft,
  // sent, and declined items are never exposed on the public page.
  const { data: orders } = await svc
    .from("change_orders")
    .select("*")
    .eq("project_id", p.id)
    .eq("status", "signed")
    .order("client_signed_at", { ascending: false });
  const signed = (orders ?? []) as ChangeOrder[];
  const totalApproved = signed.reduce((s, o) => s + Number(o.total), 0);

  return (
    <main className="min-h-screen bg-secondary/30">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <div className="mb-2 text-sm font-semibold text-primary">ScopeLock</div>
        <h1 className="text-3xl font-bold tracking-tight">{p.name}</h1>
        <p className="mt-1 text-sm capitalize text-muted-foreground">Status: {p.status}</p>
        {owner?.full_name && (
          <p className="text-sm text-muted-foreground">Managed by {owner.full_name}</p>
        )}

        {p.client_update && (
          <div className="mt-6 rounded-xl border bg-card p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Latest update
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm">{p.client_update}</p>
          </div>
        )}

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Approved change orders</h2>
            {signed.length > 0 && (
              <span className="text-sm font-semibold text-primary">
                {formatCurrency(totalApproved, currency)}
              </span>
            )}
          </div>

          {signed.length === 0 ? (
            <div className="mt-4 rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
              No approved change orders yet. This is where any additional work
              you&apos;ve approved will be logged for full transparency.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {signed.map((o) => (
                <div key={o.id} className="rounded-xl border bg-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        {o.co_number ? <span className="text-muted-foreground">#{o.co_number}</span> : null}
                        {o.title}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{o.description}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Approved {formatDate(o.client_signed_at)}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold">
                      {formatCurrency(Number(o.total), currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Powered by ScopeLock
        </p>
      </div>
    </main>
  );
}
