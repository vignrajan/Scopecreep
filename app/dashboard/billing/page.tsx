import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/plans";
import { PlanCards } from "./plan-cards";
import { ManageSubscription, UpgradedBanner } from "./manage";
import type { Plan } from "@/types";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const { upgraded } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("plan, ls_subscription_id")
    .eq("id", user.id)
    .single();
  const currentPlan: Plan = (profile?.plan as Plan) ?? "free";
  const hasSubscription = !!profile?.ls_subscription_id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;re on the <span className="font-medium">{PLANS[currentPlan].name}</span> plan.
        </p>
      </div>

      {upgraded && <UpgradedBanner />}

      <PlanCards currentPlan={currentPlan} />

      {hasSubscription && <ManageSubscription />}

      <p className="text-xs text-muted-foreground">
        Payments are processed securely by Lemon Squeezy, our Merchant of Record. Downgrades keep
        your existing projects readable — only new project creation is locked on the Free plan.
      </p>
    </div>
  );
}
