import { NextResponse } from "next/server";
import { checkEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Deploy health check. Hit GET /api/health after deploying to confirm config
 * is complete. Reports which env vars are MISSING (names/labels only — never
 * values) and whether the database is reachable. Returns 503 if a required
 * var is missing so uptime checks can alert on it.
 */
export async function GET() {
  const env = checkEnv();

  let database: "ok" | "unreachable" | "skipped" = "skipped";
  if (env.ok) {
    try {
      const svc = createServiceClient();
      const { error } = await svc.from("users").select("id", { head: true, count: "exact" });
      database = error ? "unreachable" : "ok";
    } catch {
      database = "unreachable";
    }
  }

  const healthy = env.ok && database !== "unreachable";

  return NextResponse.json(
    {
      ok: healthy,
      database,
      missingRequired: env.missingRequired,
      missingRecommended: env.missingRecommended,
      hint: healthy
        ? "All required configuration is present."
        : "Set the missing variables in your host (Vercel → Settings → Environment Variables) and redeploy.",
    },
    { status: healthy ? 200 : 503 },
  );
}
