/**
 * Runtime env-var inventory. Reports which variables are present — never their
 * values. Used by /api/health so a misconfigured deploy is obvious instead of
 * surfacing as an opaque 500. Does not throw at import time (build runs without
 * env), so it's safe to import anywhere.
 */

interface EnvVar {
  name: string;
  label: string;
}

// Without these the app cannot function (auth + core loop break).
export const REQUIRED_ENV: EnvVar[] = [
  { name: "NEXT_PUBLIC_SUPABASE_URL", label: "Supabase project URL" },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", label: "Supabase anon key" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase service role key" },
  { name: "ANTHROPIC_API_KEY", label: "Anthropic API key (AI analysis)" },
  { name: "NEXT_PUBLIC_APP_URL", label: "Public app URL (links, redirects)" },
];

// Feature-gating: the app loads without these, but a feature is disabled.
export const RECOMMENDED_ENV: EnvVar[] = [
  { name: "RESEND_API_KEY", label: "Resend API key (emails)" },
  { name: "EMAIL_FROM", label: "Email sender (emails)" },
  { name: "LEMONSQUEEZY_API_KEY", label: "Lemon Squeezy API key (billing)" },
  { name: "LEMONSQUEEZY_STORE_ID", label: "Lemon Squeezy store id (billing)" },
  { name: "LEMONSQUEEZY_WEBHOOK_SECRET", label: "Lemon Squeezy webhook secret (billing)" },
  { name: "LEMONSQUEEZY_PRO_VARIANT_ID", label: "Lemon Squeezy Pro variant id (billing)" },
  { name: "CRON_SECRET", label: "Cron secret (weekly summary)" },
];

function isSet(name: string): boolean {
  const v = process.env[name];
  return typeof v === "string" && v.trim().length > 0;
}

export interface EnvReport {
  ok: boolean;
  missingRequired: string[];
  missingRecommended: string[];
}

export function checkEnv(): EnvReport {
  const missingRequired = REQUIRED_ENV.filter((e) => !isSet(e.name)).map((e) => e.label);
  const missingRecommended = RECOMMENDED_ENV.filter((e) => !isSet(e.name)).map((e) => e.label);
  return {
    ok: missingRequired.length === 0,
    missingRequired,
    missingRecommended,
  };
}
