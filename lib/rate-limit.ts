import { createServiceClient } from "@/lib/supabase/service";
import { AI_HOURLY_RATE_LIMIT, planConfig } from "@/lib/plans";
import type { Plan } from "@/types";

/**
 * Best-effort, Postgres-backed limits for the AI endpoint. Not a distributed
 * lock — under heavy concurrency a few extra calls may slip through, which is
 * acceptable for an abuse guard. (Swap for Upstash/Redis if you need exactness.)
 */

interface LimitResult {
  allowed: boolean;
  reason?: "hourly" | "monthly";
}

export async function checkAnalysisLimits(
  userId: string,
  plan: Plan,
): Promise<LimitResult> {
  const svc = createServiceClient();

  // Project ids owned by the user (analyses live under scope_requests).
  const { data: projects } = await svc
    .from("projects")
    .select("id")
    .eq("user_id", userId);
  const projectIds = (projects ?? []).map((p) => p.id);
  if (projectIds.length === 0) return { allowed: true };

  // Hourly abuse guard (all plans).
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: hourly } = await svc
    .from("scope_requests")
    .select("id", { count: "exact", head: true })
    .in("project_id", projectIds)
    .not("ai_verdict", "is", null)
    .gte("created_at", hourAgo);
  if ((hourly ?? 0) >= AI_HOURLY_RATE_LIMIT) {
    return { allowed: false, reason: "hourly" };
  }

  // Monthly plan quota.
  const monthlyCap = planConfig(plan).maxAnalysesPerMonth;
  if (monthlyCap !== null) {
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);
    const { count: monthly } = await svc
      .from("scope_requests")
      .select("id", { count: "exact", head: true })
      .in("project_id", projectIds)
      .not("ai_verdict", "is", null)
      .gte("created_at", startOfMonth.toISOString());
    if ((monthly ?? 0) >= monthlyCap) {
      return { allowed: false, reason: "monthly" };
    }
  }

  return { allowed: true };
}
