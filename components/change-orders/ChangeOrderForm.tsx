"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { createChangeOrder } from "@/app/actions/project";

export function ChangeOrderForm({
  projectId,
  requestId,
  currency,
  defaults,
  onDone,
}: {
  projectId: string;
  requestId?: string | null;
  currency: string;
  defaults: { title: string; description: string; hours: number; rate: number };
  onDone?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(defaults.title);
  const [description, setDescription] = useState(defaults.description);
  const [hours, setHours] = useState(defaults.hours);
  const [rate, setRate] = useState(defaults.rate);

  const total = (Number(hours) || 0) * (Number(rate) || 0);

  function submit() {
    startTransition(async () => {
      const res = await createChangeOrder(projectId, {
        requestId,
        title,
        description,
        hours: Number(hours),
        rate: Number(rate),
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Change order created");
      onDone?.();
      router.push(`/project/${projectId}/change-orders`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="co-title">Title</Label>
        <Input id="co-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="co-desc">Description</Label>
        <Textarea
          id="co-desc"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="co-hours">Hours</Label>
          <Input
            id="co-hours"
            type="number"
            min="0"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="co-rate">Rate / hr</Label>
          <Input
            id="co-rate"
            type="number"
            min="0"
            step="1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-3">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="text-lg font-semibold text-primary">
          {formatCurrency(total, currency)}
        </span>
      </div>
      <Button className="w-full" onClick={submit} disabled={pending}>
        {pending ? "Creating…" : "Create change order"}
      </Button>
    </div>
  );
}
