"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, Pencil, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChangeOrderStatusBadge } from "./StatusBadge";
import { ChangeOrderPreview } from "./ChangeOrderPreview";
import { EditChangeOrderForm } from "./EditChangeOrderForm";
import { CopyButton } from "@/components/copy-button";
import { formatCurrency, formatDate, appUrl } from "@/lib/utils";
import type { ChangeOrder } from "@/types";

export function ChangeOrderCard({
  order,
  projectName,
  freelancerName,
  currency,
  hasClientEmail,
  canSend,
}: {
  order: ChangeOrder;
  projectName: string;
  freelancerName: string;
  currency: string;
  hasClientEmail: boolean;
  canSend: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  function send() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/change-orders/${order.id}/send`, { method: "POST" });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "Could not send.");
          return;
        }
        toast.success(data.emailSent ? "Sent to client" : "Marked sent (email delivery failed)");
        router.refresh();
      } catch {
        toast.error("Network error — please try again.");
      }
    });
  }

  const isDraft = order.status === "draft";
  const signUrl = order.sign_token ? appUrl(`/sign/${order.sign_token}`) : null;

  const sendDisabledReason = !canSend
    ? "Client e-sign requires the Pro plan."
    : !hasClientEmail
      ? "Add a client email to this project before sending."
      : null;

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{order.title}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">{order.description}</p>
          </div>
          <ChangeOrderStatusBadge status={order.status} />
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">{order.hours}h</span>
          <span className="text-muted-foreground">
            × {formatCurrency(Number(order.rate), currency)}
          </span>
          <span className="ml-auto text-base font-semibold text-primary">
            {formatCurrency(Number(order.total), currency)}
          </span>
        </div>

        {order.status === "signed" && (
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
            Signed {formatDate(order.client_signed_at)}
            {order.client_ip ? ` · IP ${order.client_ip}` : ""}
          </p>
        )}
        {order.status === "declined" && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
            Declined by client.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {/* Preview */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4" /> Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="sr-only">Change order preview</DialogTitle>
              </DialogHeader>
              <ChangeOrderPreview
                projectName={projectName}
                freelancerName={freelancerName}
                title={order.title}
                description={order.description}
                hours={Number(order.hours)}
                rate={Number(order.rate)}
                total={Number(order.total)}
                currency={currency}
              />
            </DialogContent>
          </Dialog>

          {/* Edit (drafts only) */}
          {isDraft && (
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit change order</DialogTitle>
                </DialogHeader>
                <EditChangeOrderForm
                  changeOrderId={order.id}
                  projectId={order.project_id}
                  currency={currency}
                  defaults={{
                    title: order.title,
                    description: order.description,
                    hours: Number(order.hours),
                    rate: Number(order.rate),
                  }}
                  onDone={() => setEditOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}

          {/* Send / Resend */}
          {(isDraft || order.status === "sent") &&
            (sendDisabledReason ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button size="sm" disabled>
                      <Send className="h-4 w-4" /> Send to client
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{sendDisabledReason}</TooltipContent>
              </Tooltip>
            ) : (
              <Button size="sm" onClick={send} disabled={pending}>
                <Send className="h-4 w-4" />
                {pending ? "Sending…" : order.status === "sent" ? "Resend" : "Send to client"}
              </Button>
            ))}

          {/* Copy sign link once sent */}
          {order.status === "sent" && signUrl && (
            <CopyButton value={signUrl} label="Copy sign link" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
