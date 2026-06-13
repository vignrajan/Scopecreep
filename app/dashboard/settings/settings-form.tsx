"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/app/actions/settings";

export function SettingsForm({
  defaults,
}: {
  defaults: { full_name: string; hourly_rate: number; currency: string };
}) {
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await updateProfile(formData);
      if (res.error) toast.error(res.error);
      else toast.success("Settings saved");
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" defaultValue={defaults.full_name} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="hourly_rate">Default hourly rate</Label>
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
      <p className="text-xs text-muted-foreground">
        Your hourly rate pre-fills new change orders.
      </p>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
