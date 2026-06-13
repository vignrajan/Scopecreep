# ScopeLock

A full-stack SaaS for freelancers to manage **scope creep** and turn out-of-scope
client requests into **signed change orders**.

> Core loop: **create project → log request → AI analysis → generate change order → client signs.**

Built with **Next.js 14 (App Router)**, **TypeScript**, **Supabase**, **Tailwind +
shadcn/ui**, **Claude** (scope analysis), **Lemon Squeezy** (billing), and **Resend** (email).

---

## Tech & architecture notes

- **Auth**: Supabase Auth (email/password + magic link). `middleware.ts` refreshes the
  session and guards `/dashboard`, `/project`, and `/onboarding`. Unauthenticated users
  are redirected to `/login`.
- **AI**: `claude-opus-4-8` via the official `@anthropic-ai/sdk`, using **structured
  outputs** so the `{verdict, reasoning, estimated_hours}` response is always
  schema-valid. If the API fails, the UI falls back to manual classification.
- **Billing**: **Lemon Squeezy** (Merchant of Record) — hosted checkout + HMAC-verified
  webhooks that sync `users.plan`. (Swapped in for Stripe.)
- **Public/client flows** (the transparency page and the signing page) use the Supabase
  **service-role** client *server-side only*, gated by an unguessable token. RLS protects
  all owner data.
- **Limits**: Free = 1 active project + 5 analyses/month; an additional 20 analyses/hour
  abuse guard applies to every plan (Postgres-backed in `lib/rate-limit.ts`).

### Routes

| Route | Purpose |
|---|---|
| `/login`, `/onboarding` | Auth + first-run setup |
| `/dashboard`, `/dashboard/settings`, `/dashboard/billing` | Authenticated app |
| `/project/[id]`, `/project/[id]/requests`, `/project/[id]/change-orders` | Project workspace |
| `/client/[token]` | **Public** client transparency page (signed change orders only) |
| `/sign/[sign_token]` | **Public** client signing page |
| `/api/ai/analyze-request` | Claude classification |
| `/api/change-orders/[id]/send` | Email a change order for signing (`[id]` = order id) |
| `/api/change-orders/[id]/sign` | Client approves/declines (`[id]` = `sign_token`, no auth) |
| `/api/checkout` | Create a Lemon Squeezy checkout |
| `/api/webhooks/lemonsqueezy` | Subscription events → `users.plan` |
| `/api/cron/weekly-summary` | Vercel Cron (Mon 9am), see `vercel.json` |

> Note: the spec's `/client/sign/[sign_token]` was moved to a top-level `/sign/[sign_token]`
> to avoid a route collision with `/client/[token]`.

---

## Local development

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

---

## 🚀 Launch checklist

### 1. Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. SQL Editor → paste and run **`supabase/schema.sql`**. This creates all tables,
   the generated `total` column, RLS policies, the `handle_new_user` trigger (creates a
   `public.users` row on signup), and the `total_approved_extras` recalculation trigger.
3. Authentication → Providers → enable **Email** (password) and **Magic Link**. Set the
   Site URL and redirect URLs to your domain (and `http://localhost:3000` for dev).
4. Project Settings → API → copy the **Project URL**, **anon key**, and **service role key**.

### 2. Lemon Squeezy
1. Create a store and your products: **Pro ($19/mo)** and **Agency ($49/mo)**.
2. Settings → API → create an **API key** → `LEMONSQUEEZY_API_KEY`.
3. Copy your numeric **Store ID** → `LEMONSQUEEZY_STORE_ID`.
4. For each subscription product, copy the **Variant ID** →
   `LEMONSQUEEZY_PRO_VARIANT_ID` / `LEMONSQUEEZY_AGENCY_VARIANT_ID`.
   *(Agency ships as "coming soon" in the UI — set the variant when you enable it.)*
5. Settings → Webhooks → add a webhook (see step 5 below) and set its **signing secret**
   → `LEMONSQUEEZY_WEBHOOK_SECRET`. Subscribe to `subscription_created`,
   `subscription_updated`, `subscription_cancelled`, `subscription_expired`.

### 3. Resend
1. Add and **verify your sending domain** at [resend.com](https://resend.com).
2. Create an API key → `RESEND_API_KEY`.
3. Set `EMAIL_FROM` to a verified sender, e.g. `ScopeLock <noreply@yourdomain.com>`.

### 4. Anthropic
1. Create a key at [console.anthropic.com](https://console.anthropic.com) →
   `ANTHROPIC_API_KEY`.

### 5. Deploy to Vercel
1. Import the repo, add **all** env vars from `.env.example`
   (set `NEXT_PUBLIC_APP_URL` to your production domain, and a long random `CRON_SECRET`).
2. Deploy. `vercel.json` registers the Monday-9am weekly-summary cron automatically; Vercel
   sends `Authorization: Bearer $CRON_SECRET` to that endpoint.
3. In **Lemon Squeezy → Webhooks**, set the endpoint URL to
   `https://your-domain.com/api/webhooks/lemonsqueezy`.

### 6. Smoke-test the full flow
sign up → onboarding (name + rate) → create project → log a request → AI verdict →
create change order → send → open the sign link → approve → confirm it appears on the
dashboard and the public `/client/[token]` page → verify the freelancer notification email.

---

## Environment variables

See [`.env.example`](./.env.example) for the complete annotated list.
