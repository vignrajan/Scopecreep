import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/lemonsqueezy";
import { createServiceClient } from "@/lib/supabase/service";
import { planForVariant } from "@/lib/plans";
import type { Plan } from "@/types";

/**
 * Lemon Squeezy webhook. We must read the RAW body for signature verification —
 * do not parse before verifying. Maps subscription events to users.plan.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName: string | undefined = payload?.meta?.event_name;
  const customUserId: string | undefined = payload?.meta?.custom_data?.user_id;
  const attrs = payload?.data?.attributes ?? {};

  const svc = createServiceClient();

  // Resolve which user this belongs to: prefer the custom user_id we attached
  // at checkout, fall back to matching the LS customer id.
  let userId = customUserId;
  if (!userId && attrs.customer_id) {
    const { data } = await svc
      .from("users")
      .select("id")
      .eq("ls_customer_id", String(attrs.customer_id))
      .single();
    userId = data?.id;
  }

  if (!userId) {
    // Nothing we can map this to — acknowledge so LS doesn't retry forever.
    console.warn("[ls-webhook] no user mapping for event:", eventName);
    return NextResponse.json({ received: true });
  }

  const variantId = attrs.variant_id ? String(attrs.variant_id) : null;
  const subscriptionId = payload?.data?.id ? String(payload.data.id) : null;
  const customerId = attrs.customer_id ? String(attrs.customer_id) : null;

  let nextPlan: Plan | null = null;
  switch (eventName) {
    case "subscription_created":
    case "subscription_updated":
    case "subscription_resumed":
    case "subscription_unpaused": {
      // Active statuses keep the paid plan; ended/expired drop to free.
      const status: string = attrs.status ?? "";
      nextPlan = ["active", "on_trial", "paused"].includes(status)
        ? planForVariant(variantId)
        : "free";
      break;
    }
    case "subscription_cancelled":
      // Cancelled but may still be active until period end; keep plan unless expired.
      nextPlan = attrs.status === "expired" ? "free" : planForVariant(variantId);
      break;
    case "subscription_expired":
      nextPlan = "free";
      break;
    default:
      return NextResponse.json({ received: true });
  }

  const update: Record<string, unknown> = {
    ls_subscription_id: subscriptionId,
    ls_variant_id: variantId,
  };
  if (customerId) update.ls_customer_id = customerId;
  if (nextPlan) update.plan = nextPlan;

  const { error } = await svc.from("users").update(update).eq("id", userId);
  if (error) {
    console.error("[ls-webhook] update error:", error);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
