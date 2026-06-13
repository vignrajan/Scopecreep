"use server";

import { createClient } from "@/lib/supabase/server";
import { getCustomerPortalUrl } from "@/lib/lemonsqueezy";

export async function getPortalUrl(): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("users")
    .select("ls_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.ls_subscription_id) {
    return { error: "No active subscription found." };
  }

  try {
    const url = await getCustomerPortalUrl(profile.ls_subscription_id);
    if (!url) return { error: "Could not open the billing portal. Try again later." };
    return { url };
  } catch (err) {
    console.error("[billing/portal]", err);
    return { error: "Could not open the billing portal. Try again later." };
  }
}
