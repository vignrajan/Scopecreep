"use client";

import { useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { Sparkles, ArrowRight, FileSignature, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RequestAnalysisBadge } from "@/components/requests/RequestAnalysisBadge";
import { ChangeOrderPreview } from "@/components/change-orders/ChangeOrderPreview";
import { formatCurrency } from "@/lib/utils";
import type { AiVerdict } from "@/types";

const SAMPLE_RATE = 90;
const CURRENCY = "USD";
const PROJECT = "Café marketing site";
const SCOPE =
  "5-page marketing website for a local café — Home, Menu, About, Gallery, Contact. Responsive design, a contact form, basic SEO, and one round of revisions. Delivered in 3 weeks.";

interface Sample {
  request: string;
  verdict: AiVerdict;
  reasoning: string;
  hours: number;
  coTitle: string;
}

const SAMPLES: Sample[] = [
  {
    request: "Can you also add online ordering with payments and a booking calendar?",
    verdict: "out_of_scope",
    reasoning:
      "Online ordering, payment processing, and scheduling are new functional systems — well beyond the agreed 5-page marketing site.",
    hours: 14,
    coTitle: "Online ordering + booking calendar",
  },
  {
    request: "Can you make the Contact heading bigger and change the button colour?",
    verdict: "in_scope",
    reasoning:
      "Small styling tweaks to existing pages fall within the agreed single round of revisions.",
    hours: 0,
    coTitle: "",
  },
  {
    request: "Could we add a blog section to the site?",
    verdict: "ambiguous",
    reasoning:
      "A blog wasn't in the original five pages. The effort depends on whether it's a simple post list or a full CMS — worth clarifying before pricing.",
    hours: 6,
    coTitle: "Blog section",
  },
];

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

export function DemoAnalyzer({ variant = "landing" }: { variant?: "landing" | "app" }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "analyzing" | "result">("idle");
  const [showCO, setShowCO] = useState(false);

  function analyze(i: number) {
    setSelected(i);
    setShowCO(false);
    setPhase("analyzing");
    track("demo_analyzed", { verdict: SAMPLES[i].verdict, variant });
    window.setTimeout(() => setPhase("result"), reducedMotion() ? 0 : 850);
  }

  function reset() {
    setSelected(null);
    setPhase("idle");
    setShowCO(false);
  }

  const sample = selected != null ? SAMPLES[selected] : null;
  const dollar = sample ? sample.hours * SAMPLE_RATE : 0;
  const showDollar = !!sample && sample.hours > 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-5 p-5 md:p-6">
        {/* Original scope */}
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Original scope · {PROJECT}
          </div>
          <p className="mt-1.5 text-sm text-foreground/90">{SCOPE}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Your rate (sample): {formatCurrency(SAMPLE_RATE, CURRENCY)}/hr
          </p>
        </div>

        {/* Request picker */}
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Pick a real client message to analyze:
          </div>
          <div className="grid gap-2">
            {SAMPLES.map((s, i) => (
              <button
                key={i}
                type="button"
                disabled={phase === "analyzing"}
                onClick={() => analyze(i)}
                className={`cursor-pointer rounded-lg border px-3 py-2.5 text-left text-sm transition-colors duration-200 hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 ${
                  selected === i ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                “{s.request}”
              </button>
            ))}
          </div>
        </div>

        {/* Result area */}
        <div aria-live="polite" className="min-h-[1px]">
          {phase === "analyzing" && (
            <div className="flex items-center gap-2 rounded-lg bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse text-primary" />
              Analyzing against the original scope…
            </div>
          )}

          {phase === "result" && sample && (
            <div className="animate-fade-up space-y-3">
              <div className="flex items-center justify-between">
                <RequestAnalysisBadge verdict={sample.verdict} />
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Try another
                </button>
              </div>

              <p className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                {sample.reasoning}
              </p>

              {showDollar && (
                <div className="flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
                  <span className="text-sm text-muted-foreground">
                    ~{sample.hours}h × {formatCurrency(SAMPLE_RATE, CURRENCY)}/hr
                  </span>
                  <span className="text-base font-bold text-primary">
                    {formatCurrency(dollar, CURRENCY)}
                  </span>
                </div>
              )}

              {showDollar && !showCO && (
                <Button
                  className="w-full cursor-pointer bg-cta text-cta-foreground hover:bg-cta/90"
                  onClick={() => setShowCO(true)}
                >
                  <FileSignature className="h-4 w-4" />
                  Create change order · {formatCurrency(dollar, CURRENCY)}
                </Button>
              )}

              {showDollar && showCO && (
                <div className="rounded-lg border bg-card p-4">
                  <ChangeOrderPreview
                    projectName={PROJECT}
                    freelancerName="You"
                    number={2}
                    title={sample.coTitle}
                    description={sample.request}
                    hours={sample.hours}
                    rate={SAMPLE_RATE}
                    total={dollar}
                    currency={CURRENCY}
                  />
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Your client signs this from a link — no account needed.
                  </p>
                </div>
              )}

              {!showDollar && (
                <p className="text-sm text-muted-foreground">
                  In scope — no change order needed. ScopeLock just saved you from
                  second-guessing it.
                </p>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        {variant === "landing" ? (
          <div className="border-t pt-4 text-center">
            <Button asChild className="cursor-pointer">
              <Link href="/login">
                Do this with your own projects — free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              This is a sample. No signup needed to try it.
            </p>
          </div>
        ) : (
          <p className="border-t pt-4 text-center text-sm text-muted-foreground">
            That&apos;s the idea — paste your own client&apos;s message in the box above to
            analyze it for real.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
