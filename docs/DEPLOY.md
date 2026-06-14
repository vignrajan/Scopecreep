# ScopeLock — Production Deploy Runbook

The deployed site 500s until configuration is in place. These are the **only**
steps between the current code and a working production app. Steps marked 🔧 are
things only you can do (they require your Vercel / Supabase / Lemon Squeezy /
Resend accounts — I can't access those).

After deploying, hit **`https://<your-domain>/api/health`** — it tells you
exactly which variables are still missing (200 = ready, 503 = something's
missing). It reports names only, never secret values.

---

## 1. Supabase 🔧
1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → run `supabase/schema.sql` (tables, RLS, triggers — incl.
   `handle_new_user`, which creates the profile row on signup).
3. Run `supabase/migrations/0001_change_order_numbers.sql` (change-order numbers).
4. **Project Settings → API** → copy **Project URL**, **anon key**, **service role key**.
5. **Authentication → URL Configuration**
   - **Site URL:** `https://<your-domain>`
   - **Redirect URLs:** add `https://<your-domain>/auth/callback`,
     `https://<your-domain>/**`, and (for local dev) `http://localhost:3000/auth/callback`.
6. **Authentication → Providers → Email:** enable; turn **Confirm email** ON for production.
7. **Authentication → Emails (SMTP):** set custom SMTP to Resend so confirmation/
   magic/reset emails actually send (the built-in sender is throttled):
   host `smtp.resend.com`, port `465`, user `resend`, pass = your Resend API key,
   sender = a verified-domain address.
8. **Authentication → Email Templates** → point links at our callback:
   - Confirm signup: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/onboarding`
   - Magic Link: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/dashboard`
   - Reset Password: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password`

## 2. Resend 🔧
- Verify your sending domain, create an API key, decide the `EMAIL_FROM` sender.

## 3. Lemon Squeezy 🔧
- Create the **Pro** ($19) and **Agency** ($49) products; copy each **variant id**.
- Copy the **store id** and create an **API key**.
- **Webhooks** → endpoint `https://<your-domain>/api/webhooks/lemonsqueezy`,
  events: `subscription_created/updated/cancelled/expired`; set a signing secret.

## 4. Vercel — Environment Variables 🔧
Project → **Settings → Environment Variables**. Add for **Production _and_ Preview**,
then **Redeploy** (env changes don't apply to existing deployments).

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | from step 1.4 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from step 1.4 |
| `SUPABASE_SERVICE_ROLE_KEY` | from step 1.4 |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `NEXT_PUBLIC_APP_URL` | `https://<your-domain>` (must equal Supabase Site URL) |
| `RESEND_API_KEY` | step 2 |
| `EMAIL_FROM` | e.g. `ScopeLock <noreply@yourdomain.com>` |
| `LEMONSQUEEZY_API_KEY` | step 3 |
| `LEMONSQUEEZY_STORE_ID` | step 3 |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | step 3 |
| `LEMONSQUEEZY_PRO_VARIANT_ID` | step 3 |
| `LEMONSQUEEZY_AGENCY_VARIANT_ID` | step 3 (optional until Agency ships) |
| `CRON_SECRET` | `e6d88770e2a5c41ce690a78202ebff8fdc767f49bc2b861f28c8c475f4308c0c` (generated for you — or run `openssl rand -hex 32`) |
| `NEXT_PUBLIC_SENTRY_DSN` | optional (error monitoring) |

> ⚠️ Common trap: a variable set for **Production only** won't apply to a
> `*.vercel.app` **preview** URL — set both. No quotes or trailing spaces in values.

## 5. Verify
1. Open `https://<your-domain>/api/health` → expect `{"ok": true, "database": "ok"}`.
   If `ok:false`, the `missingRequired` array names what's left.
2. Walk the QA checklist in `LAUNCH.md` (signup → onboarding → project → analyze →
   change order → send → sign → dashboard updates).

---

### What changed in code to support this
- `GET /api/health` — config + DB reachability check (names only, no secrets).
- `lib/env.ts` — required vs recommended env inventory.
- `/auth/callback` now only redirects to same-site relative paths (open-redirect guard).
