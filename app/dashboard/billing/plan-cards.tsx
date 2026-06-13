"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PLANS } from "@/lib/plans";
import type { Plan } from "@/types";

export function PlanCards({ currentPlan }: { currentPlan: Plan }) {
  const [pending, startTransition] = useTransition();

  function upgrade(plan: Plan) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "Could not start checkout.");
          return;
        }
        window.location.href = data.url;
      } catch {
        toast.error("Network error — please try again.");
      }
    });
  }

  const order: Plan[] = ["free", "pro", "agency"];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {order.map((id) => {
        const plan = PLANS[id];
        const isCurrent = id === currentPlan;
        const isPaid = id !== "free";
        return (
          <Card key={id} className={cn(id === "pro" && "border-primary shadow-sm")}>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {id === "pro" && <Badge>Popular</Badge>}
                {plan.comingSoon && <Badge variant="grey">Coming soon</Badge>}
              </div>
              <div className="text-2xl font-bold">{plan.price}</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <Button variant="outline" className="w-full" disabled>
                  Current plan
                </Button>
              ) : plan.comingSoon ? (
                <Button variant="outline" className="w-full" disabled>
                  Coming soon
                </Button>
              ) : isPaid ? (
                <Button
                  className="w-full"
                  disabled={pending}
                  onClick={() => upgrade(id)}
                >
                  {pending ? "…" : `Upgrade to ${plan.name}`}
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  Free forever
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
