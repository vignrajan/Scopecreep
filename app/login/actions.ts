"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { appUrl } from "@/lib/utils";

export interface AuthState {
  error?: string;
  message?: string;
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || password.length < 6) {
    return { error: "Enter an email and a password of at least 6 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: appUrl("/auth/callback?next=/onboarding") },
  });
  if (error) return { error: error.message };

  // If email confirmations are off, a session exists immediately.
  if (data.session) redirect("/onboarding");
  return { message: "Check your email to confirm your account, then sign in." };
}

export async function sendMagicLink(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: appUrl("/auth/callback?next=/dashboard") },
  });
  if (error) return { error: error.message };
  return { message: "Magic link sent — check your inbox." };
}

export async function resetPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: appUrl("/auth/callback?next=/auth/update-password"),
  });
  if (error) return { error: error.message };
  // Always report success to avoid leaking which emails are registered.
  return { message: "If that email has an account, a reset link is on its way." };
}

export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your reset link has expired. Request a new one." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
