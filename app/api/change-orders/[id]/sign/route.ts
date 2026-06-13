import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail, clientSignedEmail, clientDeclinedEmail } from "@/lib/email";
import { appUrl } from "@/lib/utils";

/**
 * PUBLIC, no-auth endpoint for client signing/declining.
 *
 * `params.id` is the `sign_token` (NOT the internal change_order UUID) — the
 * client only ever holds the token, so we validate by token via the service
 * role client. RLS is bypassed deliberately and the token is the only gate.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: signToken } = await params;
    const body = await req.json().catch(() => ({}));
    const action = body?.action as "approve" | "decline" | undefined;
    if (action !== "approve" && action !== "decline") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const svc = createServiceClient();

    const { data: order, error } = await svc
      .from("change_orders")
      .select(
        "id, title, total, status, project_id, projects(name, client_name, client_email, user_id)",
      )
      .eq("sign_token", signToken)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Change order not found" }, { status: 404 });
    }

    if (order.status === "signed") {
      return NextResponse.json(
        { error: "This change order has already been signed.", alreadySigned: true },
        { status: 409 },
      );
    }
    if (order.status === "declined") {
      return NextResponse.json(
        { error: "This change order was already declined.", alreadyDeclined: true },
        { status: 409 },
      );
    }

    const project = order.projects as unknown as {
      name: string;
      client_name: string | null;
      client_email: string | null;
      user_id: string;
    };

    // Capture client IP from forwarding headers.
    const fwd = req.headers.get("x-forwarded-for");
    const clientIp = fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;

    if (action === "approve") {
      const { error: updErr } = await svc
        .from("change_orders")
        .update({
          status: "signed",
          client_signed_at: new Date().toISOString(),
          client_ip: clientIp,
        })
        .eq("id", order.id);
      if (updErr) {
        return NextResponse.json({ error: "Could not record signature" }, { status: 500 });
      }
    } else {
      const { error: updErr } = await svc
        .from("change_orders")
        .update({ status: "declined", client_ip: clientIp })
        .eq("id", order.id);
      if (updErr) {
        return NextResponse.json({ error: "Could not record decline" }, { status: 500 });
      }
    }

    // Notify the freelancer (best-effort).
    const { data: owner } = await svc
      .from("users")
      .select("email, currency")
      .eq("id", project.user_id)
      .single();

    if (owner?.email) {
      const dashboardUrl = appUrl(`/project/${order.project_id}/change-orders`);
      const msg =
        action === "approve"
          ? clientSignedEmail({
              projectName: project.name,
              clientName: project.client_name || "",
              title: order.title,
              total: Number(order.total),
              currency: owner.currency || "USD",
              dashboardUrl,
            })
          : clientDeclinedEmail({
              projectName: project.name,
              clientName: project.client_name || "",
              clientEmail: project.client_email,
              title: order.title,
              dashboardUrl,
            });
      await sendEmail({ to: owner.email, ...msg });
    }

    return NextResponse.json({ ok: true, action });
  } catch (err) {
    console.error("[change-orders/sign] unexpected:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
