"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Outcome = "approved" | "declined" | null;

export function SignatureFlow({
  signToken,
  freelancerName,
  initialOutcome = null,
}: {
  signToken: string;
  freelancerName: string;
  initialOutcome?: Outcome;
}) {
  const [outcome, setOutcome] = useState<Outcome>(initialOutcome);
  const [loading, setLoading] = useState<"approve" | "decline" | null>(null);

  async function act(action: "approve" | "decline") {
    setLoading(action);
    try {
      const res = await fetch(`/api/change-orders/${signToken}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setOutcome(action === "approve" ? "approved" : "declined");
      } else if (data.alreadySigned) {
        setOutcome("approved");
        toast.info("This change order was already signed.");
      } else if (data.alreadyDeclined) {
        setOutcome("declined");
        toast.info("This change order was already declined.");
      } else {
        toast.error(data.error ?? "Something went wrong.");
      }
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(null);
    }
  }

  if (outcome === "approved") {
    return (
      <div className="rounded-xl border bg-green-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />
        <p className="mt-3 font-medium text-green-900">Change order approved.</p>
        <p className="mt-1 text-sm text-green-800">
          {freelancerName} will be in touch.
        </p>
      </div>
    );
  }

  if (outcome === "declined") {
    return (
      <div className="rounded-xl border bg-red-50 p-6 text-center">
        <XCircle className="mx-auto h-8 w-8 text-red-600" />
        <p className="mt-3 font-medium text-red-900">Change order declined.</p>
        <p className="mt-1 text-sm text-red-800">
          We&apos;ve let {freelancerName} know.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Sticky, prominent on mobile. */}
      <Button
        size="lg"
        className="h-14 w-full text-base"
        disabled={loading !== null}
        onClick={() => act("approve")}
      >
        {loading === "approve" ? "Submitting…" : "Approve & Sign"}
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="h-12 w-full"
        disabled={loading !== null}
        onClick={() => act("decline")}
      >
        {loading === "decline" ? "Submitting…" : "Decline"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        By approving, you agree to the additional work and cost described above.
      </p>
    </div>
  );
}
