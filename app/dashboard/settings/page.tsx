import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, hourly_rate, currency, email")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">{profile?.email}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm
            defaults={{
              full_name: profile?.full_name ?? "",
              hourly_rate: profile?.hourly_rate ?? 100,
              currency: profile?.currency ?? "USD",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
