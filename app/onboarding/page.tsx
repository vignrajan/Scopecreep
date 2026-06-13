import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingFlow } from "./onboarding-flow";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, hourly_rate, currency")
    .eq("id", user.id)
    .single();

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-12">
      <div className="w-full max-w-lg">
        <OnboardingFlow
          defaults={{
            full_name: profile?.full_name ?? "",
            hourly_rate: profile?.hourly_rate ?? 100,
            currency: profile?.currency ?? "USD",
          }}
        />
      </div>
    </main>
  );
}
