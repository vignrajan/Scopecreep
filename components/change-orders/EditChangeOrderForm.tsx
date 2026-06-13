"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { updateChangeOrder } from "@/app/actions/project";

export function EditChangeOrderForm({
  changeOrderId,
  projectId,
  currency,
  defaults,
  onDone,
}: {
  changeOrderId: string;
  projectId: string;
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
      const res = await updateChangeOrder(changeOrderId, projectId, {
        title,
        description,
        hours: Number(hours),
        rate: Number(rate),
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Change order updated");
      onDone?.();
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-title">Title</Label>
        <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-desc">Description</Label>
        <Textarea
          id="edit-desc"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-hours">Hours</Label>
          <Input
            id="edit-hours"
            type="number"
            min="0"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-rate">Rate / hr</Label>
          <Input
            id="edit-rate"
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
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}
