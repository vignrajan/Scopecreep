import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutUrl } from "@/lib/lemonsqueezy";
import { PLANS } from "@/lib/plans";
import type { Plan } from "@/types";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const plan = body?.plan as Plan | undefined;
    if (plan !== "pro" && plan !== "agency") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const config = PLANS[plan];
    if (config.comingSoon) {
      return NextResponse.json({ error: "This plan isn't available yet." }, { status: 400 });
    }

    const variantId = config.variantIdEnv ? process.env[config.variantIdEnv] : undefined;
    if (!variantId) {
      return NextResponse.json(
        { error: "Billing is not configured for this plan." },
        { status: 500 },
      );
    }

    const url = await createCheckoutUrl({
      variantId,
      userId: user.id,
      email: user.email ?? "",
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[checkout] error:", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 },
    );
  }
}
