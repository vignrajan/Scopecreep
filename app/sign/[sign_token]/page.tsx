import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { ChangeOrderPreview } from "@/components/change-orders/ChangeOrderPreview";
import { SignatureFlow } from "@/components/change-orders/SignatureFlow";
import { CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ChangeOrder } from "@/types";

export const dynamic = "force-dynamic";

export default async function SignPage({
  params,
}: {
  params: Promise<{ sign_token: string }>;
}) {
  const { sign_token } = await params;
  const svc = createServiceClient();

  const { data: order } = await svc
    .from("change_orders")
    .select(
      "id, co_number, title, description, hours, rate, total, status, client_signed_at, sign_token, project_id, projects(name, user_id)",
    )
    .eq("sign_token", sign_token)
    .single();

  if (!order) notFound();
  const o = order as unknown as ChangeOrder & {
    projects: { name: string; user_id: string };
  };

  const { data: owner } = await svc
    .from("users")
    .select("full_name, currency")
    .eq("id", o.projects.user_id)
    .single();
  const freelancerName = owner?.full_name ?? "Your freelancer";
  const currency = owner?.currency ?? "USD";

  return (
    <main className="min-h-screen bg-secondary/30">
      <div className="mx-auto max-w-xl px-5 py-10">
        <div className="mb-6 text-sm font-semibold text-primary">ScopeLock</div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <ChangeOrderPreview
            projectName={o.projects.name}
            freelancerName={freelancerName}
            number={o.co_number}
            title={o.title}
            description={o.description}
            hours={Number(o.hours)}
            rate={Number(o.rate)}
            total={Number(o.total)}
            currency={currency}
          />

          <div className="mt-8">
            {o.status === "signed" ? (
              <div className="rounded-xl border bg-green-50 p-6 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />
                <p className="mt-3 font-medium text-green-900">
                  This change order has already been signed.
                </p>
                <p className="mt-1 text-sm text-green-800">
                  Approved {formatDate(o.client_signed_at)}. {freelancerName} will be in touch.
                </p>
              </div>
            ) : o.status === "declined" ? (
              <div className="rounded-xl border bg-red-50 p-6 text-center text-sm text-red-800">
                This change order was declined.
              </div>
            ) : (
              <SignatureFlow signToken={sign_token} freelancerName={freelancerName} />
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">Powered by ScopeLock</p>
      </div>
    </main>
  );
}
