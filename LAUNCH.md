# ScopeLock — Launch Plan

A phased plan to take ScopeLock from "builds & deploys" to "ready for real users."
Items are tagged **P0** (launch blocker — must ship before public launch), **P1**
(should-have, ship within the first week), **P2** (post-launch).

---

## Status legend
- ✅ Done in this branch
- 🟡 Partial / needs config
- ⬜ Not started

---

## Phase 0 — Foundations (already built)
- ✅ Core loop: project → request → AI analysis → change order → client e-sign
- ✅ Supabase schema + RLS + triggers (`handle_new_user`, `total_approved_extras`)
- ✅ Dashboard, project workspace, scope ledger, client transparency page
- ✅ Lemon Squeezy checkout + webhook → `users.plan`
- ✅ Resend transactional emails (sent / signed / declined / weekly summary)
- ✅ Free/Pro plan limits + AI rate limiting (monthly quota + hourly guard)
- ✅ Marketing landing page (UI/UX Pro Max design system)
- ✅ Fail-safe middleware + resilient public pages

---

## Phase 1 — Launch blockers (P0) — built in this PR
- ✅ **Auth callback** (`/auth/callback`) — exchanges the email code / verifies
  the OTP so magic links, email confirmation, and password recovery actually
  sign the user in. *Without this, magic-link and email signup are broken.*
- ✅ **Password reset** — "Forgot password?" → email → set-new-password page.
- ✅ **Edit project** — change name, client name/email, scope, and status after
  creation. *Previously a project created without a client email could never
  send a change order.*
- ✅ **Delete project** (with confirmation).
- ✅ **Error / not-found pages** — `error.tsx`, `global-error.tsx`, `not-found.tsx`
  instead of raw Next.js stack traces in production.
- ✅ **Legal pages** — Privacy Policy & Terms (linked from footer + billing).
  *Required by Lemon Squeezy and for collecting user/client data.*
- ✅ **Manage subscription** — Lemon Squeezy customer-portal link so paying users
  can update card / cancel; cancel + expiry already handled by the webhook.
- ✅ **Account deletion** — settings "danger zone" (GDPR/CCPA data-deletion).
- ✅ **SEO basics** — `metadataBase`, Open Graph, `robots.ts`, `sitemap.ts`.

### Phase 1 — config you must do before launch (🟡)
- 🟡 Set **all** env vars in Vercel (see `.env.example`) for Production **and**
  Preview, then redeploy. *This is the current cause of the deployed 500s.*
- 🟡 Supabase Auth → set **Site URL** + **Redirect URLs** to your domain and
  add `https://<domain>/auth/callback` to the allow-list. Customize the email
  templates if desired.
- 🟡 Lemon Squeezy → create Pro/Agency products, copy variant IDs, point the
  webhook at `/api/webhooks/lemonsqueezy`, set the signing secret.
- 🟡 Resend → verify your sending domain, set `EMAIL_FROM`.
- 🟡 Run `supabase/schema.sql` against the production project.

---

## Phase 2 — Should-have, first week (P1)
- ⬜ Loading skeletons (`loading.tsx`) for dashboard/project routes.
- ⬜ Analytics + product events (Vercel Analytics / PostHog) — signups,
  activation (first analysis), conversions.
- ⬜ Error monitoring (Sentry) wired to the `error.tsx` digest.
- ⬜ Resend **bounce/complaint webhook** so failed client emails surface in-app.
- ⬜ Resend confirmation email on AI failure path is already manual — add an
  in-app "AI usage this month" meter for Free users.
- ⬜ PDF export of a signed change order (record-keeping for both sides).
- ⬜ Rate-limit hardening: move the AI guard to Upstash Redis for correctness
  under concurrency (currently best-effort Postgres counting).
- ⬜ Cookie/consent banner if targeting EU.
- ⬜ Favicon set + OG image asset (currently text-only metadata).

## Phase 3 — Growth & retention (P2)
- ⬜ Agency tier: teams/seats schema + white-label branding (deferred by design).
- ⬜ Email-paste ingestion / forwarding address (`source: email_paste` already
  modeled in the schema).
- ⬜ Templated change orders & saved rates.
- ⬜ Reminders for unsigned change orders.
- ⬜ Public changelog + in-app "what's new".
- ⬜ Referral / affiliate (Lemon Squeezy supports affiliates).

---

## Pre-launch QA checklist
1. Sign up with email/password → land on `/onboarding`.
2. Magic-link sign in → lands authenticated (verifies `/auth/callback`).
3. Forgot password → reset email → set new password → sign in.
4. Create project → edit it → add a client email.
5. Log a request → AI verdict → create change order → send → sign via link.
6. Confirm freelancer "signed" email + dashboard + public `/client/[token]` update.
7. Hit Free limits (2nd active project; 6th analysis) → upgrade prompts appear.
8. Upgrade via Lemon Squeezy test mode → webhook flips plan → e-sign unlocks.
9. Manage subscription portal opens; cancel reflects after webhook.
10. Delete account → data gone, signed out.
11. 404 and thrown-error pages render branded fallbacks.
12. Lighthouse: a11y ≥ 95, no console errors; responsive 375 → 1440.

## Launch day
- Flip Lemon Squeezy out of test mode; verify a real $1 purchase + refund.
- Announce (Product Hunt / IndieHackers / X). Landing CTA → `/login`.
- Watch logs (Vercel), webhook deliveries (LS), and email deliverability (Resend).
