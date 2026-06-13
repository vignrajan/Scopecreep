import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail, weeklySummaryEmail } from "@/lib/email";
import { appUrl } from "@/lib/utils";

/**
 * Weekly summary, fired by Vercel Cron (Mon 9am — see vercel.json).
 * Protected by CRON_SECRET: Vercel sends `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const svc = createServiceClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: users, error } = await svc
    .from("users")
    .select("id, email, full_name, currency");
  if (error || !users) {
    return NextResponse.json({ error: "Could not load users" }, { status: 500 });
  }

  let sent = 0;
  for (const u of users) {
    if (!u.email) continue;

    const { data: projects } = await svc
      .from("projects")
      .select("id, status")
      .eq("user_id", u.id);
    const projectIds = (projects ?? []).map((p) => p.id);
    const activeProjects = (projects ?? []).filter((p) => p.status === "active").length;

    let extrasThisWeek = 0;
    if (projectIds.length) {
      const { data: orders } = await svc
        .from("change_orders")
        .select("total, client_signed_at")
        .in("project_id", projectIds)
        .eq("status", "signed")
        .gte("client_signed_at", weekAgo);
      extrasThisWeek = (orders ?? []).reduce((s, o) => s + Number(o.total), 0);
    }

    // Skip users with no activity at all to avoid noise.
    if (activeProjects === 0 && extrasThisWeek === 0) continue;

    const { subject, html } = weeklySummaryEmail({
      fullName: u.full_name || "",
      activeProjects,
      extrasThisWeek,
      currency: u.currency || "USD",
      dashboardUrl: appUrl("/dashboard"),
    });
    if (await sendEmail({ to: u.email, subject, html })) sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
