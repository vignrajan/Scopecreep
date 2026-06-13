import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/plans";
import { PlanCards } from "./plan-cards";
import type { Plan } from "@/types";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .single();
  const currentPlan: Plan = (profile?.plan as Plan) ?? "free";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;re on the <span className="font-medium">{PLANS[currentPlan].name}</span> plan.
        </p>
      </div>
      <PlanCards currentPlan={currentPlan} />
      <p className="text-xs text-muted-foreground">
        Payments are processed securely by Lemon Squeezy, our Merchant of Record. Downgrades keep
        your existing projects readable — only new project creation is locked on the Free plan.
      </p>
    </div>
  );
}
