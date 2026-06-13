import Link from "next/link";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  FileSignature,
  ShieldCheck,
  Eye,
  Clock,
  Mail,
  Check,
  X,
  ArrowRight,
  Zap,
  TrendingDown,
  ScrollText,
  Quote,
} from "lucide-react";

export const metadata = {
  title: "ScopeLock — Stop scope creep. Get paid for every extra request.",
};

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI scope analysis",
    body: "Paste any client message. ScopeLock compares it to the agreed scope and returns a verdict — in-scope, out-of-scope, or ambiguous — with reasoning and an hours estimate.",
  },
  {
    icon: FileSignature,
    title: "Instant change orders",
    body: "Out-of-scope? Generate a polished, pre-filled change order in one click — title, description, hours, and your rate already calculated.",
  },
  {
    icon: Eye,
    title: "One-click client e-sign",
    body: "Email a clean, branded approval link. Your client reviews and signs from any device — no login, no friction. You get notified the second they do.",
  },
  {
    icon: ScrollText,
    title: "Live scope ledger",
    body: "Every request, verdict, and signed extra in one timeline per project. Always know exactly how far a project has drifted — and what it earned you.",
  },
  {
    icon: ShieldCheck,
    title: "Client transparency page",
    body: "A shareable, branded page that shows clients only their approved change orders. Builds trust and kills the 'I never agreed to that' conversation.",
  },
  {
    icon: Mail,
    title: "Automatic notifications",
    body: "Signed, declined, and weekly-summary emails go out for you. Stay on top of every approval without lifting a finger.",
  },
];

const STEPS = [
  { n: "01", title: "Paste the request", body: "Drop in what your client asked for — an email, a Slack message, a 'quick favor'." },
  { n: "02", title: "Get an AI verdict", body: "In seconds: in-scope, out-of-scope, or ambiguous, with reasoning and an hours estimate." },
  { n: "03", title: "Generate a change order", body: "One click turns an out-of-scope request into a priced, professional change order." },
  { n: "04", title: "Client signs, you get paid", body: "They approve via a link; it lands in your ledger and your transparency page updates." },
];

const COMPARISON = [
  { feature: "Detects scope creep automatically with AI", scopelock: true, email: false, suites: false },
  { feature: "Generates priced change orders from a request", scopelock: true, email: false, suites: "partial" },
  { feature: "One-click client e-signature", scopelock: true, email: false, suites: true },
  { feature: "Public client transparency log", scopelock: true, email: false, suites: false },
  { feature: "Purpose-built for scope creep", scopelock: true, email: false, suites: false },
  { feature: "Set up in under 2 minutes", scopelock: true, email: "manual", suites: false },
  { feature: "Free to start", scopelock: true, email: true, suites: "varies" },
];

const FAQS = [
  {
    q: "How does the AI know what's in scope?",
    a: "When you create a project you paste the original agreed scope. Every new request is compared against that baseline, so the verdicts are grounded in your actual agreement — not a generic guess.",
  },
  {
    q: "What if the AI gets it wrong?",
    a: "You're always in control. Every verdict is editable, and if the AI is ever unavailable you can classify a request manually with one tap. ScopeLock assists your judgment — it never overrides it.",
  },
  {
    q: "Do my clients need an account?",
    a: "No. Clients review and sign change orders from a simple link, and your transparency page is fully public. Zero friction on their side means faster approvals.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes — one active project and five AI analyses a month, free forever. Upgrade to Pro for unlimited projects, unlimited analyses, and client e-sign.",
  },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true)
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground/50">
        <X className="h-4 w-4" />
      </span>
    );
  return <span className="text-xs font-medium text-muted-foreground">{value}</span>;
}

export default async function HomePage() {
  const user = await getOptionalUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      {/* ── Nav ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 md:px-8">
          <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="text-lg">ScopeLock</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="#how" className="transition-colors duration-200 hover:text-foreground">How it works</a>
            <a href="#features" className="transition-colors duration-200 hover:text-foreground">Features</a>
            <a href="#compare" className="transition-colors duration-200 hover:text-foreground">Compare</a>
            <a href="#pricing" className="transition-colors duration-200 hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="cursor-pointer">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild className="cursor-pointer bg-cta text-cta-foreground hover:bg-cta/90">
              <Link href="/login">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.10),transparent_70%)]"
        />
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-16 md:px-8 md:pb-24 md:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> AI-powered scope protection
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
                Stop eating <span className="text-primary">scope creep.</span>
                <br />
                Get paid for every extra ask.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Freelancers lose thousands a year to “quick favors” that were never in the contract.
                ScopeLock flags out-of-scope requests with AI and turns them into signed change
                orders — in seconds, not awkward emails.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 cursor-pointer bg-cta px-7 text-base text-cta-foreground shadow-lg shadow-cta/20 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-cta/90"
                >
                  <Link href="/login">
                    Start free — no card <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 cursor-pointer px-7 text-base">
                  <a href="#how">See how it works</a>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Free forever plan · No credit card · Set up in 2 minutes
              </p>
            </div>

            {/* Product preview mock */}
            <div className="animate-fade-up [animation-delay:120ms]">
              <div className="relative rounded-2xl border border-border bg-card p-5 shadow-2xl shadow-primary/10">
                <div className="mb-4 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-sm">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Client request
                  </div>
                  <p className="mt-1.5 text-foreground/90">
                    “Can you also add a booking calendar and SMS reminders before launch?”
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                    <X className="h-3 w-3" /> Out of scope
                  </span>
                  <span className="text-xs text-muted-foreground">≈ 9h extra</span>
                </div>
                <p className="mt-2 rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground">
                  Scheduling and SMS integrations weren’t in the original 5-page marketing site scope.
                </p>
                <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Change order · Booking + SMS</span>
                    <span className="text-base font-bold text-primary">$1,350</span>
                  </div>
                  <Button
                    size="sm"
                    className="mt-3 w-full cursor-pointer bg-cta text-cta-foreground hover:bg-cta/90"
                  >
                    <FileSignature className="h-4 w-4" /> Send for signature
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-2 gap-6 border-t border-border pt-10 md:grid-cols-4">
            {[
              { stat: "1 in 3", label: "projects suffer scope creep" },
              { stat: "$5k+/yr", label: "typical unbilled extras" },
              { stat: "< 10s", label: "to an AI verdict" },
              { stat: "1-click", label: "client signatures" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-extrabold text-foreground md:text-3xl">{s.stat}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem ───────────────────────────────────────── */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-cta">
              <TrendingDown className="h-4 w-4" /> The silent margin killer
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              “Can you just quickly…” is costing you a fortune
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every extra request feels too small to bill — so you eat it. Multiply that across a
              project and you&apos;ve worked days for free, blown your timeline, and trained the
              client to expect more.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { title: "You don't notice the drift", body: "Requests arrive one at a time, buried in chats and emails. No one's tracking how far the project has wandered from the deal." },
              { title: "Billing feels awkward", body: "Bringing up money mid-project is uncomfortable, so you let it slide — and resentment quietly builds." },
              { title: "No paper trail", body: "When the invoice surprises them, it's your word against theirs. Without a signed record, you lose." },
            ].map((p) => (
              <div key={p.title} className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section id="how" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-primary">How it works</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              From “quick favor” to signed change order
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Four steps. The whole loop takes less time than writing the awkward email you were
              dreading.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="text-sm font-bold text-primary">{s.n}</div>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className="scroll-mt-20 border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-primary">Features</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              Everything you need to defend your scope
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Purpose-built for the one job generic contract apps ignore: catching and billing scope
              creep before it eats your margin.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ────────────────────────────────────── */}
      <section id="compare" className="scroll-mt-20">
        <div className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-cta">
              <Zap className="h-4 w-4" /> Why ScopeLock wins
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              The only tool built for scope creep
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Email and spreadsheets are manual and leave no record. Generic freelance suites handle
              invoices and contracts — but none of them catch scope creep for you.
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center border-b border-border bg-secondary/50 px-4 py-4 text-sm font-semibold md:px-6">
              <div>Capability</div>
              <div className="text-center text-primary">ScopeLock</div>
              <div className="text-center text-muted-foreground">Email &amp; sheets</div>
              <div className="text-center text-muted-foreground">Freelance suites</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center px-4 py-4 text-sm md:px-6 ${
                  i % 2 ? "bg-secondary/20" : ""
                }`}
              >
                <div className="pr-3 font-medium">{row.feature}</div>
                <div className="flex justify-center"><Cell value={row.scopelock} /></div>
                <div className="flex justify-center"><Cell value={row.email} /></div>
                <div className="flex justify-center"><Cell value={row.suites} /></div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Comparison reflects scope-creep-specific workflows. Full-suite tools offer broader
            invoicing/CRM features outside this scope.
          </p>
        </div>
      </section>

      {/* ── Testimonial ───────────────────────────────────── */}
      <section className="border-y border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8 md:py-20">
          <Quote className="mx-auto h-8 w-8 opacity-60" />
          <blockquote className="mt-5 text-2xl font-semibold leading-snug md:text-3xl">
            “I recovered an extra $2,400 on a single project in my first month — work I would have
            done for free before.”
          </blockquote>
          <div className="mt-5 text-sm opacity-80">
            Independent designer · illustrative result
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section id="pricing" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-primary">Pricing</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              Start free. Upgrade when it pays for itself.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              One signed change order pays for years of Pro.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
            {[
              { name: "Free", price: "$0", desc: "Try the full loop.", features: ["1 active project", "5 analyses / month", "Manual classification"], cta: "Start free", highlight: false, soon: false },
              { name: "Pro", price: "$19", per: "/mo", desc: "For working freelancers.", features: ["Unlimited projects", "Unlimited analyses", "Client e-sign", "Email notifications"], cta: "Start free trial", highlight: true, soon: false },
              { name: "Agency", price: "$49", per: "/mo", desc: "For small teams.", features: ["Everything in Pro", "5 team seats", "White-label pages"], cta: "Coming soon", highlight: false, soon: true },
            ].map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-2xl border bg-card p-6 transition-all duration-200 ${
                  p.highlight
                    ? "border-primary shadow-xl shadow-primary/10 md:-translate-y-2"
                    : "border-border hover:-translate-y-1 hover:shadow-lg"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cta px-3 py-1 text-xs font-bold text-cta-foreground">
                    Most popular
                  </span>
                )}
                <div className="font-semibold">{p.name}</div>
                <div className="mt-2 flex items-end gap-0.5">
                  <span className="text-3xl font-extrabold">{p.price}</span>
                  {p.per && <span className="mb-1 text-sm text-muted-foreground">{p.per}</span>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={3} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild={!p.soon}
                  disabled={p.soon}
                  className={`mt-6 cursor-pointer ${
                    p.highlight ? "bg-cta text-cta-foreground hover:bg-cta/90" : ""
                  }`}
                  variant={p.highlight ? "default" : "outline"}
                >
                  {p.soon ? <span>{p.cta}</span> : <Link href="/login">{p.cta}</Link>}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
          <h2 className="text-center text-3xl font-extrabold tracking-tight md:text-4xl">
            Questions, answered
          </h2>
          <div className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-border bg-card p-5 [&_summary]:cursor-pointer"
              >
                <summary className="flex items-center justify-between font-semibold marker:content-['']">
                  {f.q}
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(255,255,255,0.15),transparent)]"
          />
          <h2 className="relative text-3xl font-extrabold tracking-tight md:text-4xl">
            Your next “quick favor” should be a change order.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg opacity-90">
            Set up your first project free in two minutes and never give away scope again.
          </p>
          <div className="relative mt-8">
            <Button
              asChild
              size="lg"
              className="h-12 cursor-pointer bg-cta px-8 text-base text-cta-foreground shadow-lg transition-transform duration-200 hover:-translate-y-0.5 hover:bg-cta/90"
            >
              <Link href="/login">
                Start free — no card <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground md:flex-row md:px-8">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            ScopeLock
          </div>
          <div className="flex items-center gap-5">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
            <Link href="/login" className="transition-colors hover:text-foreground">Sign in</Link>
          </div>
          <div>© {new Date().getFullYear()} ScopeLock</div>
        </div>
      </footer>
    </div>
  );
}
