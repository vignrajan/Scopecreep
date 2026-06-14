# ScopeLock — Product & Distribution Strategy

> Analysis grounded in the actual codebase (this repo) as of June 2026. The live
> site (https://scopecreep-six.vercel.app/) is currently throwing a server error
> because the Vercel environment variables aren't set yet, so this analysis is
> based on the code, not a live walkthrough. **Assumptions are flagged inline.**

---

## 0. What's actually built (reality check)

Verified in code, end-to-end and **not stubbed**:

| Capability | Status | Where |
|---|---|---|
| AI scope analysis | ✅ Real — `claude-opus-4-8`, structured JSON output (`verdict`/`reasoning`/`estimated_hours`), persisted to `scope_requests`, with a manual-classification fallback if the API fails | `lib/claude/index.ts`, `app/api/ai/analyze-request` |
| Dollar value at analysis | ✅ Real — `hours × rate` shown on the request + on the create button | `components/requests/RequestItem.tsx` |
| Change orders (pre-filled, editable) | ✅ Real | `components/change-orders/*` |
| Client e-sign (no login) | ✅ Real — tokenized `/sign/[token]`, records timestamp + IP | `app/sign/[sign_token]` |
| Scope ledger + dashboard totals | ✅ Real — `total_approved_extras` maintained by a DB trigger | `supabase/schema.sql` |
| Public transparency page | ✅ Real — signed orders only | `app/client/[token]` |
| Notifications (sent/signed/declined/weekly) | ✅ Real — Resend + Vercel cron | `lib/email`, `app/api/cron` |
| CSV export | ✅ Real | `app/api/export/change-orders` |
| Billing Free/Pro | ✅ Real — Lemon Squeezy checkout + webhook | `lib/lemonsqueezy`, `app/api/webhooks` |
| **Agency tier (5 seats + white-label)** | ❌ **Marketing-only / "coming soon"** — no teams schema, no branding | — |

**The single biggest marketing-vs-code gap is the Agency tier.** Everything else on the landing page is genuinely working. Do not sell Agency as available; the UI already labels it "coming soon," which is correct.

---

## 1. Need & Problem Validation

### Ideal Customer Profile
**Sharpest ICP: solo or 2–5-person studios doing _fixed-price_ web/app development or design for SMB clients, billing $50–150/hr, who receive client requests over Slack/email.**

Segmented:

| Discipline | Scope-creep pain | Willingness to pay $19 | Fit |
|---|---|---|---|
| Web/app **developers** (fixed-price builds) | **High** — "can you also add…" is constant; clear deliverables make creep obvious | High (bill $75–150/hr) | **Primary** |
| **Designers** (web/brand/UI) | **High** — endless revisions / "one more round" | High | **Primary** |
| Small **marketing agencies** | Medium — creep = work beyond a retainer | High | Secondary (needs retainer framing) |
| **Writers** | Medium — extra revisions/pieces, but lower ticket | Lower | Weak |
| **Consultants** | Low — usually bill hourly, so creep auto-bills | High but low need | Weakest |

By project style: **fixed-price = highest pain** (creep directly eats margin) → primary. **Retainer = medium** (creep = out-of-retainer asks). **Hourly = lowest** (extra time is already billed; the only hook is dispute protection via e-sign).

### Trigger moment
People don't search for "scope creep tool" cold — they search **right after getting burned**: they finished a fixed-price project having done 20–40% unbilled extra work, or a client disputed an invoice, or they're kicking off a big new client and want to "do it right this time." The acquisition surfaces that matter are therefore (a) **post-pain search** ("how to bill for extra work," "change order template") and (b) **new-project setup** mindset. Capture both with content + a fast aha.

### Strongest alternatives & where ScopeLock genuinely wins
1. **"Just eat it" / send the awkward email** — the real status quo competitor. ScopeLock wins by removing the awkwardness *and* creating a signed record. This is the strongest wedge.
2. **Static change-order templates / contract clauses** (Gumroad/Etsy, blog freebies) — cheap, one-time, but passive. ScopeLock wins on the *decision* ("is this in scope, what's it worth?") + e-sign + tracking. Loses on price (templates are ~$0–20 once).
3. **Freelance suites — Bonsai, HoneyBook** — do contracts/invoices/proposals and *some* change orders, but **none do AI scope-creep detection or the paste→verdict→price loop.** ScopeLock wins on the specific decision moment and speed; loses where someone already lives in Bonsai and rarely hits creep. **Risk: a suite bolts on an "AI scope check" feature.**

**Where ScopeLock is only "nice to have":** hourly billers, low-ticket writers, and anyone with a disciplined retainer-addendum process already.

---

## 2. Product Gaps & Quick Wins

### Broken / missing / marketing-only
- **Agency tier** (seats, white-label) — not built.
- **No "aha without your own data."** Activation today requires the user to (1) create a project with a real scope and (2) paste a real client request before they see any magic. That's two steps of friction before the payoff.
- **No request auto-capture** — "paste from anywhere" is true but fully manual (the schema even has `source='email_paste'` reserved, unused).

### Highest-leverage activation wins (free → first "aha" = first verdict)
1. **"Try a sample request" button** on the empty requests state that runs the AI on a canned scope+request pair → instant verdict + dollar value with zero typing. *Highest impact, low effort.* This is the demo that sells the product.
2. **Collapse onboarding into the loop** — let the user paste scope **and** a first request in one screen, so step 3 of onboarding *is* their first analysis.
3. **A "recovered $" counter** ("You've flagged $1,350 of out-of-scope work") on the dashboard — makes ROI undeniable before the paywall.

### Highest-leverage conversion wins (free → Pro)
- The current Pro wall is **e-sign / sending** (free can analyze + draft but not send). **Keep this** — the send-for-signature moment is the value-capture moment and the right place to charge. Make sure the upgrade prompt fires exactly there (it does).
- Add the "recovered $" number to the upgrade prompt: *"Send this to recover $1,350 — upgrade to Pro."*

### Features that widen the addressable market (pick 1–2)
1. **Slack + email capture** (forward to a ScopeLock address, or a Slack "Send to ScopeLock" action) — removes the paste step and captures requests *where they actually arrive*. Biggest TAM + retention lever; aligns with the existing `email_paste` source field.
2. **Zapier/Make app + webhook** — slots into existing freelancer stacks (new Gmail label → analyze).
3. **Invoice handoff** — beyond CSV, a one-click push of approved change orders to Stripe Invoicing / QuickBooks / Wave. Closes the money loop and raises perceived value.

---

## 3. Positioning & Messaging

The current landing already leads with **"Stop eating scope creep. Get paid for every extra ask."** — that's a strong problem+money blend; keep the **money outcome primary**. "AI scope creep detector" alone is too passive/educational and isn't how people search. Lead with the financial outcome and the awkwardness removal; let "AI" be the *how*, not the headline.

**Three positioning statements:**
1. **"Get paid for every 'quick favor.'"** → solo freelancers; emotional + money. Best for social/cold and Reddit.
2. **"Turn scope creep into signed change orders — in seconds."** → devs/designers who know the term. Best for SEO/high-intent search.
3. **"The contract-protection layer for client work."** → agencies/higher-end; trust/risk framing. Best for the Agency tier.

**By segment:**
- **Solo freelancers:** awkwardness + money ("never send the awkward email again").
- **Small agencies:** margin protection + professionalism + paper trail ("protect margins on every project").
- **Agency tier:** white-label client pages + team seats + dispute/audit trail.

---

## 4. Go-to-Market (first 30 days, concrete)

### Communities
- **Do:** answer real "how do you handle clients asking for extra?" threads in r/freelance, r/web_design, r/forhire-adjacent subs, IndieHackers, and designer/dev Discords with genuine advice + a **free change-order template** lead magnet (no link-dropping). Post one build-in-public story on **IndieHackers / r/SideProject** (promo allowed there). 
- **Don't:** drop promo links in r/freelance main threads (removed/banned), mass-DM, or post the same copy across subs.
- **Specific first post:** *"How I stopped losing ~$5k/yr to scope creep (free template inside)"* → template → soft tool mention in comments.

### Content / SEO (long-tail, with intent)
1. "Free Freelance Change Order Template (+ how to use it)" — *transactional*
2. "How to Charge a Client for Out-of-Scope Work (scripts + template)" — *transactional/info*
3. "What to Say When a Client Asks for 'One More Thing'" — *info, high empathy*
4. "How to Handle Scope Creep Without Losing the Client" — *info*
5. "12 Real Scope Creep Examples (and How to Price Them)" — *info, link-bait*
6. "How to Write a Change Order Clients Actually Sign" — *transactional*
7. "Why Fixed-Price Projects Bleed Money (and the Fix)" — *info → product*
8. "The Scope Clause Every Freelance Contract Needs" — *info*
9. "How to Price Extra Revisions Without Killing the Relationship" — *info (designers)*

Each ends with a soft CTA to a free analysis. The template freebie doubles as the community lead magnet.

### Cold outreach / partnerships
- **Freelance coaches / YouTubers** (freelance-business creators) → affiliate program (Lemon Squeezy supports affiliates).
- **Contract-template sellers on Gumroad/Etsy** → bundle "template + free month of ScopeLock."
- **Productized-service / agency communities** (Indie Worldwide, agency Slacks) → founder AMA.
- **30-day action:** ship an LS affiliate + a one-page partner deck; personally reach 10 coaches/template sellers.

### Product Hunt
**Not launch-ready yet.** Needed first: (1) the deploy actually working (env vars), (2) ≥3–5 beta testimonials, (3) a 60–90s demo video/GIF of paste→verdict→change order→sign, (4) onboarding polish + the sample-request demo so PH traffic hits aha without their own data, (5) Agency clearly "coming soon." **Run a soft beta first**, collect proof + fix activation, *then* PH.

### Paid acquisition — back-of-envelope
*Assume ~12-month retention, ~70% gross margin after AI/email/infra → LTV ≈ $160, contribution ≈ $110. At a 3:1 LTV:CAC target, allowable CAC ≈ $35–50.*
- **Meta/Reddit interest targeting "freelancers"** is too broad → likely CAC > $60–80 → **unprofitable cold at $19/mo.**
- **Google Search on tight high-intent terms** ("change order template," "scope creep tool") *can* clear the bar if conversion holds. **Verdict:** paid is marginal cold; only worth a small ($300–500) Google Search test on transactional keywords *after* free→Pro conversion is proven. Lead with content/community/integration instead.

### Integration-led distribution
**Likely a faster wedge than the standalone app.** Ranked: (1) **Gmail/Slack capture** — where requests actually arrive; strategically aligned with the core loop and best for retention. (2) **Chrome extension** "Send selection to ScopeLock" — works from any web app, very demoable. (3) **Zapier listing** — discovery + glue. (4) **AppSumo** — a one-time traction/cash burst but discount-heavy and churny; use for social proof, not core revenue. **Recommendation: build Slack/Gmail capture as the strategic wedge.**

---

## 5. Monetization & Pricing

- **$19/mo is reasonable, arguably underpriced** for devs/designers billing $50–150/hr — one recovered hour pays 2–7 months. Keep $19 for solo to minimize friction, but consider testing **$29** once value is proven, and sell on "$ recovered," not features.
- **Add an annual plan** (~$190/yr = 2 months free) — better cash + retention.
- **Add a capped founding/AppSumo-style offer** for the first 100–500 users to seed testimonials and case studies. Caveat: LTDs attract churny non-ICP users — cap it tightly and treat it as a *proof-generation* mechanism, not revenue.
- **The "5 analyses/month" free limit is too tight for a paste-driven tool.** A freelancer with one active project can hit 5 in week one and bounce before the value compounds. The **real wall should be e-sign/sending (already Pro-only) and the 1-active-project limit** — those are value-capture moments. **Recommendation: raise free analyses to ~10/mo (or make it per-project), and keep e-sign as the Pro gate.** Let free users fully feel the loop; charge at the moment they capture money.

---

## 6. Risks & Open Questions

**Biggest risk — behavioral, not technical: will freelancers actually _send_ the change order?** The entire funnel (and all revenue) hinges on the user being willing to send an AI-generated change order to a client. If it feels too transactional/aggressive, they won't send → no value capture → no conversion. Trust in the AI verdict is a secondary risk (mitigated by always-editable verdicts + manual fallback). Plus: crowded freelance-tools market, low switching cost from "just eat it," and a single-feature product that a suite (Bonsai) could clone.

**Open questions, in priority order:**
1. **Will users actually send change orders to clients?** Measure *send rate* with 10 beta users. — **P0 (validates the whole thesis).**
2. Which ICP segment converts best — fixed-price devs vs designers vs small agencies? Instrument signup → activation → send → pay by segment. — **P1.**
3. Which wall converts best — analyses, projects, or e-sign? A/B once there's volume. — **P1.**
4. Does AI verdict accuracy hold across disciplines well enough to be trusted? Run an eval on real scopes. — **P2.**
5. Is standalone web enough, or is capture-at-source (Slack/Gmail) required for retention? Interview churned free users. — **P2.**

---

## Next 2 Weeks (ordered by impact / effort)

1. **Fix the production deploy** — set Vercel env vars + Supabase auth config (Site URL, redirect allow-list, custom SMTP). *Blocker; nothing else matters until the site works.* — low effort.
2. **Ship a "Try a sample request" demo** on the empty state → instant aha with zero user data. — high impact, low/med.
3. **Recruit 5–10 beta freelancers (fixed-price devs/designers); watch them; measure send rate.** Answers the #1 risk. — high impact, med.
4. **Loosen free analyses to ~10/mo, keep e-sign as the Pro wall, add a "recovered $" counter.** — med impact, low.
5. **Publish 2 SEO posts + a free change-order template** ("how to bill for extra work" + the template lead magnet). — med impact, med.
6. **Add an annual plan + a capped founding offer** to seed testimonials. — med impact, low.
7. **Record a 60–90s demo GIF/video** of the core loop for the landing page (and later Product Hunt). — med impact, low/med.
