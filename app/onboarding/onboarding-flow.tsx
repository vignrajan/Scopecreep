"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProjectForm } from "@/components/project/ProjectForm";
import { CopyButton } from "@/components/copy-button";
import { updateProfile } from "@/app/actions/settings";
import { appUrl } from "@/lib/utils";

export function OnboardingFlow({
  defaults,
}: {
  defaults: { full_name: string; hourly_rate: number; currency: string };
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [shareLink, setShareLink] = useState<string | null>(null);

  function saveProfile(formData: FormData) {
    startTransition(async () => {
      const res = await updateProfile(formData);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Saved");
      setStep(2);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to ScopeLock</CardTitle>
        <CardDescription>Step {step} of 3</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <form action={saveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Your name</Label>
              <Input id="full_name" name="full_name" defaultValue={defaults.full_name} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly rate</Label>
                <Input
                  id="hourly_rate"
                  name="hourly_rate"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue={defaults.hourly_rate}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" name="currency" defaultValue={defaults.currency} maxLength={3} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving…" : "Continue"}
            </Button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create your first project. You can add more later.
            </p>
            <ProjectForm
              submitLabel="Create project"
              onCreated={({ token }) => {
                setShareLink(appUrl(`/client/${token}`));
                setStep(3);
              }}
            />
            <button
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              onClick={() => router.push("/dashboard")}
            >
              Skip for now
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 text-center">
            <div className="text-4xl">🎉</div>
            <div>
              <h3 className="text-lg font-semibold">Share this link with your client</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                They&apos;ll see a clean, branded page of approved change orders — no login needed.
              </p>
            </div>
            {shareLink && (
              <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-2">
                <code className="flex-1 truncate text-left text-xs">{shareLink}</code>
                <CopyButton value={shareLink} label="Copy" />
              </div>
            )}
            <Button className="w-full" onClick={() => router.push("/dashboard")}>
              Go to dashboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
