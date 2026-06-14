import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, changeOrderSentEmail } from "@/lib/email";
import { planConfig } from "@/lib/plans";
import { appUrl } from "@/lib/utils";
import type { Plan } from "@/types";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load order + project (RLS enforces ownership).
    const { data: order, error } = await supabase
      .from("change_orders")
      .select(
        "id, co_number, title, description, hours, rate, total, status, sign_token, project_id, projects(name, client_name, client_email)",
      )
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Change order not found" }, { status: 404 });
    }

    const project = order.projects as unknown as {
      name: string;
      client_name: string | null;
      client_email: string | null;
    };

    if (!project.client_email) {
      return NextResponse.json(
        { error: "This project has no client email. Add one before sending." },
        { status: 400 },
      );
    }

    // Client e-sign is a paid feature.
    const { data: profile } = await supabase
      .from("users")
      .select("plan, full_name, currency")
      .eq("id", user.id)
      .single();
    const plan: Plan = (profile?.plan as Plan) ?? "free";
    if (!planConfig(plan).clientESign) {
      return NextResponse.json(
        { error: "Client e-sign requires the Pro plan.", upgrade: true },
        { status: 403 },
      );
    }

    if (order.status === "signed") {
      return NextResponse.json(
        { error: "This change order has already been signed." },
        { status: 409 },
      );
    }

    // Reuse an existing sign token if present (idempotent resend).
    const signToken = order.sign_token ?? nanoid(24);
    const signUrl = appUrl(`/sign/${signToken}`);

    const { error: updateErr } = await supabase
      .from("change_orders")
      .update({
        status: "sent",
        sign_token: signToken,
        sent_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: "Could not update change order" }, { status: 500 });
    }

    const { subject, html } = changeOrderSentEmail({
      projectName: project.name,
      freelancerName: profile?.full_name || "Your freelancer",
      number: order.co_number,
      title: order.title,
      description: order.description,
      hours: Number(order.hours),
      rate: Number(order.rate),
      total: Number(order.total),
      currency: profile?.currency || "USD",
      signUrl,
    });

    const sent = await sendEmail({ to: project.client_email, subject, html });

    return NextResponse.json({ ok: true, emailSent: sent, signUrl });
  } catch (err) {
    console.error("[change-orders/send] unexpected:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
