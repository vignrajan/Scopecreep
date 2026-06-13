"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RequestAnalysisBadge } from "./RequestAnalysisBadge";
import { ChangeOrderForm } from "@/components/change-orders/ChangeOrderForm";
import { formatDate } from "@/lib/utils";
import { setManualVerdict, markRequestStatus } from "@/app/actions/project";
import type { ScopeRequest } from "@/types";

const STATUS_LABEL: Record<ScopeRequest["status"], { label: string; variant: "green" | "grey" | "red" }> = {
  pending: { label: "Pending", variant: "grey" },
  change_order_created: { label: "Change order created", variant: "green" },
  declined: { label: "Declined", variant: "red" },
  accepted_free: { label: "Accepted (free)", variant: "grey" },
};

export function RequestItem({
  request,
  projectId,
  currency,
  defaultRate,
}: {
  request: ScopeRequest;
  projectId: string;
  currency: string;
  defaultRate: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);

  const canCreateOrder =
    request.status === "pending" &&
    (request.ai_verdict === "out_of_scope" || request.ai_verdict === "ambiguous");
  const needsManual = !request.ai_verdict;

  function classify(verdict: "in_scope" | "out_of_scope") {
    startTransition(async () => {
      const res = await setManualVerdict(request.id, projectId, verdict);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Classified");
        router.refresh();
      }
    });
  }

  function setStatus(status: "declined" | "accepted_free") {
    startTransition(async () => {
      const res = await markRequestStatus(request.id, projectId, status);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Updated");
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="whitespace-pre-wrap text-sm">{request.content}</p>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <RequestAnalysisBadge verdict={request.ai_verdict} />
            <span className="text-xs text-muted-foreground">{formatDate(request.created_at)}</span>
          </div>
        </div>

        {request.ai_reasoning && (
          <p className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            {request.ai_reasoning}
            {request.ai_verdict === "out_of_scope" &&
              request.ai_estimated_hours != null &&
              ` · ~${request.ai_estimated_hours}h extra`}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {request.status !== "pending" && (
            <Badge variant={STATUS_LABEL[request.status].variant}>
              {STATUS_LABEL[request.status].label}
            </Badge>
          )}

          {needsManual && (
            <>
              <span className="text-xs text-muted-foreground">Classify manually:</span>
              <Button size="sm" variant="outline" disabled={pending} onClick={() => classify("in_scope")}>
                In scope
              </Button>
              <Button size="sm" variant="outline" disabled={pending} onClick={() => classify("out_of_scope")}>
                Out of scope
              </Button>
            </>
          )}

          {canCreateOrder && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Create change order</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New change order</DialogTitle>
                </DialogHeader>
                <ChangeOrderForm
                  projectId={projectId}
                  requestId={request.id}
                  currency={currency}
                  defaults={{
                    title:
                      request.ai_reasoning?.slice(0, 60) || "Additional work outside scope",
                    description: request.content,
                    hours: request.ai_estimated_hours || 1,
                    rate: defaultRate,
                  }}
                  onDone={() => setDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}

          {request.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => setStatus("accepted_free")}
              >
                Accept free
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => setStatus("declined")}
              >
                Decline
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
