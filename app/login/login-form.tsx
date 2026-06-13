"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { signIn, signUp, sendMagicLink, type AuthState } from "./actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "…" : label}
    </Button>
  );
}

const initial: AuthState = {};

export function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup" | "magic">("signin");

  const action = mode === "signin" ? signIn : mode === "signup" ? signUp : sendMagicLink;
  const [state, formAction] = useFormState(action, initial);

  // Surface messages/errors as toasts (in an effect so it fires once per result,
  // not on every render).
  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.message) toast.success(state.message);
  }, [state]);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@studio.com" required />
          </div>

          {mode !== "magic" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <SubmitButton
            label={
              mode === "signin"
                ? "Sign in"
                : mode === "signup"
                  ? "Create account"
                  : "Send magic link"
            }
          />
        </form>

        <div className="mt-4 space-y-2 text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <p>
              No account?{" "}
              <button className="font-medium text-primary" onClick={() => setMode("signup")}>
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Have an account?{" "}
              <button className="font-medium text-primary" onClick={() => setMode("signin")}>
                Sign in
              </button>
            </p>
          )}
          <p>
            <button
              className="font-medium text-primary"
              onClick={() => setMode(mode === "magic" ? "signin" : "magic")}
            >
              {mode === "magic" ? "Use a password instead" : "Email me a magic link"}
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
