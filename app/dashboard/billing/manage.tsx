"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPortalUrl } from "./actions";

export function UpgradedBanner() {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex items-center gap-3 py-4">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <p className="text-sm">
          You&apos;re upgraded! It can take a few seconds for your plan to update as we confirm the
          payment — refresh if it still shows Free.
        </p>
      </CardContent>
    </Card>
  );
}

export function ManageSubscription() {
  const [pending, startTransition] = useTransition();

  function open() {
    startTransition(async () => {
      const res = await getPortalUrl();
      if (res.error || !res.url) {
        toast.error(res.error ?? "Could not open the billing portal.");
        return;
      }
      window.open(res.url, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 py-4">
        <div>
          <div className="text-sm font-medium">Manage subscription</div>
          <p className="text-xs text-muted-foreground">
            Update your payment method or cancel anytime.
          </p>
        </div>
        <Button variant="outline" className="cursor-pointer" disabled={pending} onClick={open}>
          {pending ? "Opening…" : "Open portal"} <ExternalLink className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
