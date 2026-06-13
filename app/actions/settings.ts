"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface SettingsResult {
  error?: string;
  ok?: boolean;
}

export async function updateProfile(formData: FormData): Promise<SettingsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const full_name = String(formData.get("full_name") ?? "").trim();
  const hourly_rate = Number(formData.get("hourly_rate"));
  const currency = String(formData.get("currency") ?? "USD").trim().toUpperCase();

  if (!full_name) return { error: "Name is required." };
  if (!(hourly_rate > 0)) return { error: "Hourly rate must be greater than zero." };

  const { error } = await supabase
    .from("users")
    .update({ full_name, hourly_rate, currency })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}
