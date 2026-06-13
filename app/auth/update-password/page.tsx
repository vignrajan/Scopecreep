import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdatePasswordForm } from "./form";

export default async function UpdatePasswordPage() {
  // Reached via the recovery link → /auth/callback established a session.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Set a new password</CardTitle>
          </CardHeader>
          <CardContent>
            <UpdatePasswordForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
