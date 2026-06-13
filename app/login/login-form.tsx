"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { signIn, signUp, sendMagicLink, resetPassword, type AuthState } from "./actions";

type Mode = "signin" | "signup" | "magic" | "reset";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full cursor-pointer" disabled={pending}>
      {pending ? "…" : label}
    </Button>
  );
}

const initial: AuthState = {};

const ACTIONS = { signin: signIn, signup: signUp, magic: sendMagicLink, reset: resetPassword };
const LABELS: Record<Mode, string> = {
  signin: "Sign in",
  signup: "Create account",
  magic: "Send magic link",
  reset: "Send reset link",
};

export function LoginForm() {
  const [mode, setMode] = useState<Mode>("signin");

  const [state, formAction] = useFormState(ACTIONS[mode], initial);

  // Surface messages/errors as toasts (effect so it fires once per result).
  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.message) toast.success(state.message);
  }, [state]);

  const showPassword = mode === "signin" || mode === "signup";

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@studio.com" required />
          </div>

          {showPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "signin" && (
                  <button
                    type="button"
                    className="cursor-pointer text-xs font-medium text-primary"
                    onClick={() => setMode("reset")}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
            </div>
          )}

          <SubmitButton label={LABELS[mode]} />
        </form>

        <div className="mt-4 space-y-2 text-center text-sm text-muted-foreground">
          {mode === "reset" ? (
            <p>
              Remembered it?{" "}
              <button className="cursor-pointer font-medium text-primary" onClick={() => setMode("signin")}>
                Back to sign in
              </button>
            </p>
          ) : mode === "signin" ? (
            <p>
              No account?{" "}
              <button className="cursor-pointer font-medium text-primary" onClick={() => setMode("signup")}>
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Have an account?{" "}
              <button className="cursor-pointer font-medium text-primary" onClick={() => setMode("signin")}>
                Sign in
              </button>
            </p>
          )}
          {mode !== "reset" && (
            <p>
              <button
                className="cursor-pointer font-medium text-primary"
                onClick={() => setMode(mode === "magic" ? "signin" : "magic")}
              >
                {mode === "magic" ? "Use a password instead" : "Email me a magic link"}
              </button>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
