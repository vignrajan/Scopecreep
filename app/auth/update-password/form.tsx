"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword, type AuthState } from "@/app/login/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full cursor-pointer" disabled={pending}>
      {pending ? "Saving…" : "Update password"}
    </Button>
  );
}

export function UpdatePasswordForm() {
  const [state, formAction] = useFormState(updatePassword, {} as AuthState);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
      </div>
      <SubmitButton />
    </form>
  );
}
